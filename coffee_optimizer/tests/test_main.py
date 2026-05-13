import copy
from unittest.mock import MagicMock, patch

import pytest

from coffee_optimizer.models import (
    BuildingData,
    DailyDemandData,
    DailyPriceData,
    DeliveryParamData,
    DiscountTierData,
    DistributorData,
    HistoricalArrival,
    OptimizationRequest,
)
from coffee_optimizer.optimizer import _SOLVE_STATUS_MAP, run_optimization

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------


def _tiers():
    return [
        DiscountTierData(level=1, quantity_kg=30, unit_price=10.0),
        DiscountTierData(level=2, quantity_kg=60, unit_price=8.0),
    ]


@pytest.fixture
def base_request() -> OptimizationRequest:
    """Minimal valid input – single distributor, building, 2-day horizon."""
    return OptimizationRequest(
        planning_days=[1, 2],
        decay_rate=0.0,
        distributors=[
            DistributorData(
                id="D1",
                daily_prices=[
                    DailyPriceData(
                        day=1, base_price=12.0, availability_kg=100, discount_tiers=_tiers()
                    ),
                    DailyPriceData(
                        day=2, base_price=12.0, availability_kg=100, discount_tiers=_tiers()
                    ),
                ],
                delivery_params=[
                    DeliveryParamData(
                        building_id="B1", lead_time_days=0, fixed_cost_pln=50
                    ),
                ],
            ),
        ],
        buildings=[
            BuildingData(
                id="B1",
                max_capacity_kg=200,
                initial_inventory_kg=0.0,
                daily_demand=[
                    DailyDemandData(day=1, demand_kg=10),
                    DailyDemandData(day=2, demand_kg=10),
                ],
            ),
        ],
    )


@pytest.fixture
def full_mock_request() -> OptimizationRequest:
    """Full 7-day, 2-distributor, 2-building dataset."""
    days = list(range(1, 8))

    def prices(base: float, tier1: float, tier2: float) -> list[DailyPriceData]:
        return [
            DailyPriceData(
                day=t,
                base_price=base,
                availability_kg=100,
                discount_tiers=[
                    DiscountTierData(level=1, quantity_kg=30, unit_price=tier1),
                    DiscountTierData(level=2, quantity_kg=60, unit_price=tier2),
                ],
            )
            for t in days
        ]

    return OptimizationRequest(
        planning_days=days,
        decay_rate=0.05,
        historical_arrivals=[
            HistoricalArrival(distributor_id="D1", building_id="B1", day=1, quantity_kg=25.0),
        ],
        distributors=[
            DistributorData(
                id="D1",
                daily_prices=prices(12.0, 10.0, 8.0),
                delivery_params=[
                    DeliveryParamData(building_id="B1", lead_time_days=1, fixed_cost_pln=50),
                    DeliveryParamData(building_id="B2", lead_time_days=1, fixed_cost_pln=50),
                ],
            ),
            DistributorData(
                id="D2",
                daily_prices=prices(11.0, 9.5, 7.5),
                delivery_params=[
                    DeliveryParamData(building_id="B1", lead_time_days=2, fixed_cost_pln=60),
                    DeliveryParamData(building_id="B2", lead_time_days=2, fixed_cost_pln=60),
                ],
            ),
        ],
        buildings=[
            BuildingData(
                id="B1",
                max_capacity_kg=50,
                initial_inventory_kg=19.0,
                daily_demand=[DailyDemandData(day=t, demand_kg=15.0) for t in days],
            ),
            BuildingData(
                id="B2",
                max_capacity_kg=75,
                initial_inventory_kg=32.0,
                daily_demand=[DailyDemandData(day=t, demand_kg=12.0) for t in days],
            ),
        ],
    )


# ---------------------------------------------------------------------------
# _SOLVE_STATUS_MAP unit tests
# ---------------------------------------------------------------------------


class TestSolveStatusMap:
    def test_known_statuses_present(self):
        assert "solved" in _SOLVE_STATUS_MAP
        assert "infeasible" in _SOLVE_STATUS_MAP
        assert "unbounded" in _SOLVE_STATUS_MAP

    def test_solved_maps_to_optimal(self):
        assert _SOLVE_STATUS_MAP["solved"] == "Optimal"

    def test_infeasible_maps_correctly(self):
        assert _SOLVE_STATUS_MAP["infeasible"] == "Infeasible"

    def test_unknown_key_returns_not_solved(self):
        assert _SOLVE_STATUS_MAP.get("unknown_status", "Not Solved") == "Not Solved"


# ---------------------------------------------------------------------------
# Integration tests (real AMPL/CBC solver)
# ---------------------------------------------------------------------------


class TestSolveOptimal:
    def test_returns_optimal_status(self, base_request):
        result = run_optimization(base_request)
        assert result.status == "Optimal"

    def test_total_cost_is_positive(self, base_request):
        result = run_optimization(base_request)
        assert result.total_cost_pln is not None
        assert result.total_cost_pln > 0

    def test_orders_list_structure(self, base_request):
        result = run_optimization(base_request)
        for order in result.orders:
            assert order.distributor_id
            assert order.building_id
            assert order.day >= 1
            assert order.threshold_level >= 0
            assert order.quantity_kg > 0

    def test_orders_distributor_ids_are_valid(self, base_request):
        result = run_optimization(base_request)
        valid = {d.id for d in base_request.distributors}
        for order in result.orders:
            assert order.distributor_id in valid

    def test_orders_building_ids_are_valid(self, base_request):
        result = run_optimization(base_request)
        valid = {b.id for b in base_request.buildings}
        for order in result.orders:
            assert order.building_id in valid

    def test_orders_days_are_valid(self, base_request):
        result = run_optimization(base_request)
        valid_days = set(base_request.planning_days)
        for order in result.orders:
            assert order.day in valid_days

    def test_inventory_levels_structure(self, base_request):
        result = run_optimization(base_request)
        for inv in result.inventory_levels:
            assert inv.building_id
            assert inv.day >= 1
            assert inv.level_kg is not None

    def test_inventory_levels_building_ids_are_valid(self, base_request):
        result = run_optimization(base_request)
        valid = {b.id for b in base_request.buildings}
        for inv in result.inventory_levels:
            assert inv.building_id in valid

    def test_inventory_levels_days_match_planning(self, base_request):
        result = run_optimization(base_request)
        valid_days = set(base_request.planning_days)
        for inv in result.inventory_levels:
            assert inv.day in valid_days

    def test_inventory_levels_non_negative(self, base_request):
        result = run_optimization(base_request)
        for inv in result.inventory_levels:
            assert inv.level_kg >= -1e-6

    def test_full_dataset_optimal(self, full_mock_request):
        result = run_optimization(full_mock_request)
        assert result.status == "Optimal"
        assert result.total_cost_pln > 0


class TestSolveWithoutHistoricalArrivals:
    def test_no_historical_arrivals_still_solves(self, base_request):
        assert base_request.historical_arrivals == []
        result = run_optimization(base_request)
        assert result.status == "Optimal"

    def test_with_historical_arrivals(self, full_mock_request):
        assert full_mock_request.historical_arrivals
        result = run_optimization(full_mock_request)
        assert result.status == "Optimal"


class TestSolveInventoryConstraint:
    def test_inventory_does_not_exceed_v_max(self, base_request):
        result = run_optimization(base_request)
        v_max = {b.id: b.max_capacity_kg for b in base_request.buildings}
        for inv in result.inventory_levels:
            assert inv.level_kg <= v_max[inv.building_id] + 1e-6

    def test_large_initial_inventory_reduces_orders(self, base_request):
        """Starting with enough stock should result in fewer ordered kg overall."""
        low_stock = copy.deepcopy(base_request)
        low_stock.buildings[0].initial_inventory_kg = 0.0
        high_stock = copy.deepcopy(base_request)
        high_stock.buildings[0].initial_inventory_kg = 100.0

        result_low = run_optimization(low_stock)
        result_high = run_optimization(high_stock)

        total_low = sum(o.quantity_kg for o in result_low.orders)
        total_high = sum(o.quantity_kg for o in result_high.orders)
        assert total_high <= total_low


# ---------------------------------------------------------------------------
# Non-optimal scenarios
# ---------------------------------------------------------------------------


class TestSolveNonOptimal:
    def _make_infeasible(self, base_request: OptimizationRequest) -> OptimizationRequest:
        infeasible = copy.deepcopy(base_request)
        # Demand far exceeds availability and inventory capacity.
        for b in infeasible.buildings:
            b.max_capacity_kg = 10
            for dd in b.daily_demand:
                dd.demand_kg = 1000.0
        for d in infeasible.distributors:
            for dp in d.daily_prices:
                dp.availability_kg = 1
        return infeasible

    def test_infeasible_returns_correct_structure(self, base_request):
        result = run_optimization(self._make_infeasible(base_request))
        assert result.status != "Optimal"
        assert result.total_cost_pln is None
        assert result.orders == []
        assert result.inventory_levels == []
        assert result.cost_breakdown is None


# ---------------------------------------------------------------------------
# Mocked AMPL — result-parsing logic in isolation
# ---------------------------------------------------------------------------


def _make_ampl_mock(
    solve_result: str,
    x0_vals: dict | None = None,
    x_vals: dict | None = None,
    I_vals: dict | None = None,
    total_cost: float = 0.0,
) -> MagicMock:
    ampl = MagicMock()
    ampl.get_value.return_value = solve_result

    def _var_mock(vals):
        v = MagicMock()
        v.get_values.return_value.to_dict.return_value = vals or {}
        return v

    variables = {
        "x0": _var_mock(x0_vals),
        "x": _var_mock(x_vals),
        "I": _var_mock(I_vals),
    }
    ampl.get_variable.side_effect = lambda name: variables[name]

    objective = MagicMock()
    objective.value.return_value = total_cost
    ampl.get_objective.return_value = objective

    return ampl


class TestResultParsing:
    """Exercise result-parsing using a mocked AMPL instance."""

    @patch("coffee_optimizer.optimizer.AMPL")
    def test_x0_order_parsed(self, MockAMPL, base_request):
        MockAMPL.return_value = _make_ampl_mock(
            solve_result="solved",
            x0_vals={("D1", "B1", 1): 20.0},
            x_vals={},
            I_vals={("B1", 0): 0.0, ("B1", 1): 10.0, ("B1", 2): 0.0},
            total_cost=290.0,
        )

        result = run_optimization(base_request)

        assert result.status == "Optimal"
        assert len(result.orders) == 1
        order = result.orders[0]
        assert order.distributor_id == "D1"
        assert order.building_id == "B1"
        assert order.day == 1
        assert order.threshold_level == 0
        assert abs(order.quantity_kg - 20.0) < 1e-9

    @patch("coffee_optimizer.optimizer.AMPL")
    def test_x_discount_order_parsed(self, MockAMPL, base_request):
        MockAMPL.return_value = _make_ampl_mock(
            solve_result="solved",
            x0_vals={},
            x_vals={("D1", "B1", 2, 1): 35.0},
            I_vals={("B1", 0): 0.0, ("B1", 1): 0.0, ("B1", 2): 25.0},
            total_cost=350.0,
        )

        result = run_optimization(base_request)

        assert len(result.orders) == 1
        order = result.orders[0]
        assert order.threshold_level == 1
        assert abs(order.quantity_kg - 35.0) < 1e-9

    @patch("coffee_optimizer.optimizer.AMPL")
    def test_zero_quantity_orders_excluded(self, MockAMPL, base_request):
        MockAMPL.return_value = _make_ampl_mock(
            solve_result="solved",
            x0_vals={("D1", "B1", 1): 0.0, ("D1", "B1", 2): 1e-9},
            x_vals={},
            I_vals={("B1", 0): 0.0, ("B1", 1): 0.0, ("B1", 2): 0.0},
            total_cost=0.0,
        )

        result = run_optimization(base_request)

        assert result.orders == []

    @patch("coffee_optimizer.optimizer.AMPL")
    def test_inventory_index_0_excluded(self, MockAMPL, base_request):
        """Index 0 is the initial state and must not appear in inventory_levels."""
        MockAMPL.return_value = _make_ampl_mock(
            solve_result="solved",
            x0_vals={},
            x_vals={},
            I_vals={("B1", 0): 99.0, ("B1", 1): 5.0, ("B1", 2): 0.0},
            total_cost=0.0,
        )

        result = run_optimization(base_request)

        days_reported = [inv.day for inv in result.inventory_levels]
        assert 0 not in days_reported
        assert set(days_reported) <= set(base_request.planning_days)

    @patch("coffee_optimizer.optimizer.AMPL")
    def test_non_optimal_empty_collections(self, MockAMPL, base_request):
        mock_ampl = MagicMock()
        mock_ampl.get_value.return_value = "infeasible"
        MockAMPL.return_value = mock_ampl

        result = run_optimization(base_request)

        assert result.status == "Infeasible"
        assert result.total_cost_pln is None
        assert result.orders == []
        assert result.inventory_levels == []
        assert result.cost_breakdown is None

    @patch("coffee_optimizer.optimizer.AMPL")
    def test_unknown_solve_result_gives_not_solved(self, MockAMPL, base_request):
        mock_ampl = MagicMock()
        mock_ampl.get_value.return_value = "limit"
        MockAMPL.return_value = mock_ampl

        result = run_optimization(base_request)

        assert result.status == "Not Solved"
