import copy
import pytest
from unittest.mock import MagicMock, patch

from coffee_optimizer.main import solve_coffee_optimization, _SOLVE_STATUS_MAP

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def base_data():
    """Minimal valid input – single distributor, building, 2-day horizon."""
    return {
        "T": [1, 2],
        "D": ["D1"],
        "B": ["B1"],
        "L": [1, 2],
        "alpha": 0.0,
        "V_max": {"B1": 200},
        "Q": {1: 30, 2: 60},
        "I0": {"B1": 0.0},
        "P0": {("D1", 1): 12.0, ("D1", 2): 12.0},
        "P": {
            ("D1", 1, 1): 10.0,
            ("D1", 1, 2): 8.0,
            ("D1", 2, 1): 10.0,
            ("D1", 2, 2): 8.0,
        },
        "C_fix": {("D1", "B1"): 50},
        "Demand": {("B1", 1): 10.0, ("B1", 2): 10.0},
        "S_avail": {("D1", 1): 100, ("D1", 2): 100},
        "LT": {("D1", "B1"): 0},
    }


@pytest.fixture
def full_mock_data():
    """Full 7-day, 2-distributor, 2-building dataset (mirrors main.py mock_api_data)."""
    days = list(range(1, 8))
    distributors = ["D1", "D2"]
    buildings = ["B1", "B2"]
    levels = [1, 2]

    P0 = {(d, t): (12.0 if d == "D1" else 11.0) for d in distributors for t in days}
    P = {
        (d, t, lvl): (
            10.0
            if (d == "D1" and lvl == 1)
            else (
                8.0
                if (d == "D1" and lvl == 2)
                else 9.5 if (d == "D2" and lvl == 1) else 7.5
            )
        )
        for d in distributors
        for t in days
        for lvl in levels
    }

    return {
        "T": days,
        "D": distributors,
        "B": buildings,
        "L": levels,
        "alpha": 0.05,
        "V_max": {"B1": 50, "B2": 75},
        "Q": {1: 30, 2: 60},
        "I0": {"B1": 19.0, "B2": 32.0},
        "P0": P0,
        "P": P,
        "C_fix": {
            ("D1", "B1"): 50,
            ("D1", "B2"): 50,
            ("D2", "B1"): 60,
            ("D2", "B2"): 60,
        },
        "Demand": {
            (b, t): (15.0 if b == "B1" else 12.0) for b in buildings for t in days
        },
        "S_avail": {(d, t): 100 for d in distributors for t in days},
        "LT": {("D1", "B1"): 1, ("D2", "B1"): 2, ("D1", "B2"): 1, ("D2", "B2"): 2},
        "H_arrival": {("D1", "B1", 1): 25.0},
    }


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
        result = _SOLVE_STATUS_MAP.get("unknown_status", "Not Solved")
        assert result == "Not Solved"


# ---------------------------------------------------------------------------
# Integration tests – actual solver runs
# ---------------------------------------------------------------------------


class TestSolveOptimal:
    def test_returns_optimal_status(self, base_data):
        result = solve_coffee_optimization(base_data)
        assert result["status"] == "Optimal"

    def test_result_keys_present(self, base_data):
        result = solve_coffee_optimization(base_data)
        assert set(result.keys()) == {
            "status",
            "total_cost",
            "orders",
            "inventory_levels",
            "cost_breakdown",
        }

    def test_total_cost_is_positive(self, base_data):
        result = solve_coffee_optimization(base_data)
        assert result["total_cost"] is not None
        assert result["total_cost"] > 0

    def test_cost_breakdown_sums_to_total(self, base_data):
        result = solve_coffee_optimization(base_data)
        cb = result["cost_breakdown"]
        expected = cb["purchase_base"] + cb["purchase_discount"] + cb["fixed_delivery"]
        assert abs(expected - cb["total"]) < 1e-6
        assert abs(result["total_cost"] - cb["total"]) < 1e-6

    def test_cost_breakdown_non_negative_parts(self, base_data):
        result = solve_coffee_optimization(base_data)
        cb = result["cost_breakdown"]
        assert cb["purchase_base"] >= 0
        assert cb["purchase_discount"] >= 0
        assert cb["fixed_delivery"] >= 0

    def test_orders_list_structure(self, base_data):
        result = solve_coffee_optimization(base_data)
        for order in result["orders"]:
            assert "distributor_id" in order
            assert "building_id" in order
            assert "day" in order
            assert "threshold_level" in order
            assert "quantity_kg" in order
            assert order["quantity_kg"] > 0

    def test_orders_distributor_ids_are_valid(self, base_data):
        result = solve_coffee_optimization(base_data)
        valid_distributors = set(base_data["D"])
        for order in result["orders"]:
            assert order["distributor_id"] in valid_distributors

    def test_orders_building_ids_are_valid(self, base_data):
        result = solve_coffee_optimization(base_data)
        valid_buildings = set(base_data["B"])
        for order in result["orders"]:
            assert order["building_id"] in valid_buildings

    def test_orders_days_are_valid(self, base_data):
        result = solve_coffee_optimization(base_data)
        valid_days = set(base_data["T"])
        for order in result["orders"]:
            assert order["day"] in valid_days

    def test_inventory_levels_structure(self, base_data):
        result = solve_coffee_optimization(base_data)
        for inv in result["inventory_levels"]:
            assert "building_id" in inv
            assert "day" in inv
            assert "level_kg" in inv

    def test_inventory_levels_building_ids_are_valid(self, base_data):
        result = solve_coffee_optimization(base_data)
        valid_buildings = set(base_data["B"])
        for inv in result["inventory_levels"]:
            assert inv["building_id"] in valid_buildings

    def test_inventory_levels_days_match_T(self, base_data):
        result = solve_coffee_optimization(base_data)
        valid_days = set(base_data["T"])
        for inv in result["inventory_levels"]:
            assert inv["day"] in valid_days

    def test_inventory_levels_non_negative(self, base_data):
        result = solve_coffee_optimization(base_data)
        for inv in result["inventory_levels"]:
            assert inv["level_kg"] >= -1e-6

    def test_full_dataset_optimal(self, full_mock_data):
        result = solve_coffee_optimization(full_mock_data)
        assert result["status"] == "Optimal"
        assert result["total_cost"] > 0


class TestSolveWithoutHArrival:
    def test_no_h_arrival_key_still_solves(self, base_data):
        # H_arrival is optional; omitting it must not raise
        assert "H_arrival" not in base_data
        result = solve_coffee_optimization(base_data)
        assert result["status"] == "Optimal"

    def test_with_h_arrival_key(self, full_mock_data):
        assert "H_arrival" in full_mock_data
        result = solve_coffee_optimization(full_mock_data)
        assert result["status"] == "Optimal"


class TestSolveInventoryConstraint:
    def test_inventory_does_not_exceed_v_max(self, base_data):
        result = solve_coffee_optimization(base_data)
        v_max = base_data["V_max"]
        for inv in result["inventory_levels"]:
            b = inv["building_id"]
            assert inv["level_kg"] <= v_max[b] + 1e-6

    def test_large_initial_inventory_reduces_orders(self, base_data):
        """Starting with enough stock should result in fewer ordered kg overall."""
        low_stock = copy.deepcopy(base_data)
        low_stock["I0"] = {"B1": 0.0}
        high_stock = copy.deepcopy(base_data)
        high_stock["I0"] = {"B1": 100.0}

        result_low = solve_coffee_optimization(low_stock)
        result_high = solve_coffee_optimization(high_stock)

        total_low = sum(o["quantity_kg"] for o in result_low["orders"])
        total_high = sum(o["quantity_kg"] for o in result_high["orders"])
        assert total_high <= total_low


# ---------------------------------------------------------------------------
# Non-optimal scenarios
# ---------------------------------------------------------------------------


class TestSolveNonOptimal:
    def test_infeasible_returns_correct_structure(self, base_data):
        """Make it infeasible: demand exceeds all possible supply and inventory."""
        infeasible = copy.deepcopy(base_data)
        # Set demand much higher than distributor can supply
        infeasible["Demand"] = {("B1", 1): 1000.0, ("B1", 2): 1000.0}
        infeasible["S_avail"] = {("D1", 1): 1, ("D1", 2): 1}
        infeasible["V_max"] = {"B1": 10}
        result = solve_coffee_optimization(infeasible)
        assert result["status"] != "Optimal"
        assert result["total_cost"] is None
        assert result["orders"] == []
        assert result["inventory_levels"] == []
        assert result["cost_breakdown"] is None

    def test_non_optimal_result_keys(self, base_data):
        infeasible = copy.deepcopy(base_data)
        infeasible["Demand"] = {("B1", 1): 1000.0, ("B1", 2): 1000.0}
        infeasible["S_avail"] = {("D1", 1): 1, ("D1", 2): 1}
        infeasible["V_max"] = {"B1": 10}
        result = solve_coffee_optimization(infeasible)
        assert set(result.keys()) == {
            "status",
            "total_cost",
            "orders",
            "inventory_levels",
            "cost_breakdown",
        }


# ---------------------------------------------------------------------------
# Mocked AMPL – tests for result-parsing logic in isolation
# ---------------------------------------------------------------------------


def _make_ampl_mock(
    solve_result: str, x0_vals: dict, x_vals: dict, I_vals: dict, y_skl_vals: dict
):
    """Return a configured AMPL mock."""
    ampl = MagicMock()
    ampl.get_value.return_value = solve_result

    def _var_mock(vals):
        v = MagicMock()
        v.get_values.return_value.to_dict.return_value = vals
        return v

    ampl.get_variable.side_effect = lambda name: {
        "x0": _var_mock(x0_vals),
        "x": _var_mock(x_vals),
        "I": _var_mock(I_vals),
        "y_skl": _var_mock(y_skl_vals),
    }[name]

    return ampl


class TestResultParsing:
    """Tests that exercise result-parsing using a mocked AMPL instance."""

    def _input(self):
        return {
            "T": [1, 2],
            "D": ["D1"],
            "B": ["B1"],
            "L": [1, 2],
            "alpha": 0.0,
            "V_max": {"B1": 200},
            "Q": {1: 30, 2: 60},
            "I0": {"B1": 0.0},
            "P0": {("D1", 1): 12.0, ("D1", 2): 12.0},
            "P": {
                ("D1", 1, 1): 10.0,
                ("D1", 1, 2): 8.0,
                ("D1", 2, 1): 10.0,
                ("D1", 2, 2): 8.0,
            },
            "C_fix": {("D1", "B1"): 50},
            "Demand": {("B1", 1): 10.0, ("B1", 2): 10.0},
            "S_avail": {("D1", 1): 100, ("D1", 2): 100},
            "LT": {("D1", "B1"): 0},
        }

    @patch("coffee_optimizer.main.AMPL")
    def test_x0_order_parsed(self, MockAMPL):
        mock_ampl = _make_ampl_mock(
            solve_result="solved",
            x0_vals={("D1", "B1", 1): 20.0},
            x_vals={},
            I_vals={("B1", 0): 0.0, ("B1", 1): 10.0, ("B1", 2): 0.0},
            y_skl_vals={("D1", "B1", 1): 1.0, ("D1", "B1", 2): 0.0},
        )
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        assert result["status"] == "Optimal"
        assert len(result["orders"]) == 1
        order = result["orders"][0]
        assert order["distributor_id"] == "D1"
        assert order["building_id"] == "B1"
        assert order["day"] == 1
        assert order["threshold_level"] == 0
        assert abs(order["quantity_kg"] - 20.0) < 1e-9

    @patch("coffee_optimizer.main.AMPL")
    def test_x_discount_order_parsed(self, MockAMPL):
        mock_ampl = _make_ampl_mock(
            solve_result="solved",
            x0_vals={},
            x_vals={("D1", "B1", 2, 1): 35.0},
            I_vals={("B1", 0): 0.0, ("B1", 1): 0.0, ("B1", 2): 25.0},
            y_skl_vals={("D1", "B1", 1): 0.0, ("D1", "B1", 2): 1.0},
        )
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        assert len(result["orders"]) == 1
        order = result["orders"][0]
        assert order["threshold_level"] == 1
        assert abs(order["quantity_kg"] - 35.0) < 1e-9

    @patch("coffee_optimizer.main.AMPL")
    def test_fixed_delivery_cost_counted(self, MockAMPL):
        mock_ampl = _make_ampl_mock(
            solve_result="solved",
            x0_vals={("D1", "B1", 1): 20.0},
            x_vals={},
            I_vals={("B1", 0): 0.0, ("B1", 1): 10.0, ("B1", 2): 0.0},
            y_skl_vals={("D1", "B1", 1): 1.0, ("D1", "B1", 2): 0.0},
        )
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        # C_fix[("D1","B1")] = 50 and y_skl=1 for day 1
        assert result["cost_breakdown"]["fixed_delivery"] == 50.0

    @patch("coffee_optimizer.main.AMPL")
    def test_purchase_base_cost_correct(self, MockAMPL):
        mock_ampl = _make_ampl_mock(
            solve_result="solved",
            x0_vals={("D1", "B1", 1): 20.0},
            x_vals={},
            I_vals={("B1", 0): 0.0, ("B1", 1): 10.0, ("B1", 2): 0.0},
            y_skl_vals={("D1", "B1", 1): 0.0, ("D1", "B1", 2): 0.0},
        )
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        # P0[("D1",1)] = 12.0, quantity = 20.0
        assert abs(result["cost_breakdown"]["purchase_base"] - 240.0) < 1e-9

    @patch("coffee_optimizer.main.AMPL")
    def test_zero_quantity_orders_excluded(self, MockAMPL):
        mock_ampl = _make_ampl_mock(
            solve_result="solved",
            x0_vals={
                ("D1", "B1", 1): 0.0,
                ("D1", "B1", 2): 1e-9,
            },  # both below threshold
            x_vals={},
            I_vals={("B1", 0): 0.0, ("B1", 1): 0.0, ("B1", 2): 0.0},
            y_skl_vals={("D1", "B1", 1): 0.0, ("D1", "B1", 2): 0.0},
        )
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        assert result["orders"] == []

    @patch("coffee_optimizer.main.AMPL")
    def test_inventory_index_0_excluded(self, MockAMPL):
        """Index 0 is the initial state and must not appear in inventory_levels."""
        mock_ampl = _make_ampl_mock(
            solve_result="solved",
            x0_vals={},
            x_vals={},
            I_vals={("B1", 0): 99.0, ("B1", 1): 5.0, ("B1", 2): 0.0},
            y_skl_vals={},
        )
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        days_reported = [inv["day"] for inv in result["inventory_levels"]]
        assert 0 not in days_reported
        # Only T indices should appear
        assert set(days_reported) <= set(self._input()["T"])

    @patch("coffee_optimizer.main.AMPL")
    def test_non_optimal_empty_collections(self, MockAMPL):
        mock_ampl = MagicMock()
        mock_ampl.get_value.return_value = "infeasible"
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        assert result["status"] == "Infeasible"
        assert result["total_cost"] is None
        assert result["orders"] == []
        assert result["inventory_levels"] == []
        assert result["cost_breakdown"] is None

    @patch("coffee_optimizer.main.AMPL")
    def test_unknown_solve_result_gives_not_solved(self, MockAMPL):
        mock_ampl = MagicMock()
        mock_ampl.get_value.return_value = "limit"
        MockAMPL.return_value = mock_ampl

        result = solve_coffee_optimization(self._input())

        assert result["status"] == "Not Solved"
