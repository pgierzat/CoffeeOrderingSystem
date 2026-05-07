from amplpy import AMPL


def solve_coffee_optimization(api_data: dict) -> dict:

    ampl = AMPL()

    ampl.eval(
        r"""
        set T ordered;      # horyzont czasowy
        set D;              # dystrybutorzy
        set B;              # biurowce
        set L ordered;      # progi rabatowe

        # PARAMETRY
        param V_max {B} >= 0;                # V^{max}_b
        param Q {L} >= 0;                    # Q_l - dolny próg rabatu
        param P0 {D, T} >= 0;                # P_{d,t,0} - cena poniżej 1. progu
        param P {D, T, L} >= 0;              # P_{d,t,l} - cena nad progiem l
        param C_fix {D, B} >= 0;             # C^{fix}_{d,b} - stały koszt dostawy
        param Demand {B, T} >= 0;            # D_{b,t} - zapotrzebowanie
        param I0 {B} >= 0;                   # I_{b,0} - początkowy stan magazynu
        param alpha >= 0, <= 1;              # \alpha - procent dziennej utraty
        param S_avail {D, T} >= 0;           # S_{d,t} - maksymalna dostępność dystrybutora
        param S_max = max {d in D, t in T} S_avail[d,t]; # S^{max}
        param LT {D, B} >= 0 integer;        # X_{d,b} - czas dostawy

        # Zamówienia historyczne
        param H_arrival {D, B, T} >= 0 default 0;

        # ZMIENNE DECYZYJNE (Zgodnie z sekcją 2.3)
        var x0 {D, B, T} >= 0;               # x_{d,b,t,0} - ilość pod progiem 1
        var x {D, B, T, L} >= 0;             # x_{d,b,t,l} - ilość nad progiem l
        var I {B, 0..card(T)} >= 0;          # I_{b,t} - stan magazynu (0 to stan początkowy)
        var y_skl {D, B, T} binary;          # y^{skl}_{d,b,t} - flaga zamówienia (koszt stały)
        var y_rab {D, B, T, L} binary;       # y_{d,b,t,l} - flaga przekroczenia progu l

        # FUNKCJA CELU
        minimize Total_Cost:
            sum {t in T, b in B, d in D} P0[d,t] * x0[d,b,t] +
            sum {t in T, b in B, d in D, l in L} P[d,t,l] * x[d,b,t,l] +
            sum {t in T, b in B, d in D} C_fix[d,b] * y_skl[d,b,t];

        # OGRANICZENIA

        # Bilans początkowy magazynu
        s.t. Init_Inv {b in B}:
            I[b,0] = I0[b];

        # Równanie 2: Bilans zapasów (z uwzględnieniem czasu dostawy LT)
        s.t. Inv_Balance {b in B, t in T}:
            I[b,ord(t)] = (1 - alpha) * I[b,ord(t)-1]
                + sum {d in D, tau in T: ord(tau) + LT[d,b] == ord(t)} x0[d,b,tau]
                + sum {d in D, l in L, tau in T: ord(tau) + LT[d,b] == ord(t)} x[d,b,tau,l]
                + sum {d in D} H_arrival[d,b,t]
                - Demand[b,t];

        # Równanie 3: Pojemność magazynu
        s.t. Max_Inv_Limit {b in B, t in T}:
            I[b,ord(t)] <= V_max[b];

        # Równanie 4: Powiązanie zamówienia ze zmienną binarną
        s.t. Link_Order_Binary {d in D, b in B, t in T}:
            x0[d,b,t] <= S_avail[d,t] * y_skl[d,b,t];

        # Równanie 5: Ograniczenie dostępności u dystrybutora
        s.t. Max_Availability {d in D, t in T}:
            sum {b in B} (x0[d,b,t] + sum {l in L} x[d,b,t,l]) <= S_avail[d,t];

        # Równania 6-10: Ograniczenia progowe rabatów
        s.t. Threshold_0_Max {d in D, b in B, t in T}:
            x0[d,b,t] <= Q[first(L)];

        s.t. Threshold_0_Min {d in D, b in B, t in T}:
            x0[d,b,t] >= Q[first(L)] * y_rab[d,b,t,first(L)];

        s.t. Threshold_L_Max_Normal {d in D, b in B, t in T, l in L: l <> last(L)}:
            x[d,b,t,l] <= (Q[next(l,L)] - Q[l]) * y_rab[d,b,t,l];

        s.t. Threshold_L_Max_Last {d in D, b in B, t in T, l in L: l == last(L)}:
            x[d,b,t,l] <= S_max * y_rab[d,b,t,l];

        s.t. Threshold_L_Min_Normal {d in D, b in B, t in T, l in L: l <> last(L)}:
            x[d,b,t,l] >= (Q[next(l,L)] - Q[l]) * y_rab[d,b,t,next(l,L)];
    """
    )

    ampl.get_set("T").set_values(api_data["T"])
    ampl.get_set("D").set_values(api_data["D"])
    ampl.get_set("B").set_values(api_data["B"])
    ampl.get_set("L").set_values(api_data["L"])

    ampl.get_parameter("alpha").set(api_data["alpha"])
    ampl.get_parameter("V_max").set_values(api_data["V_max"])
    ampl.get_parameter("Q").set_values(api_data["Q"])
    ampl.get_parameter("I0").set_values(api_data["I0"])

    ampl.get_parameter("P0").set_values(api_data["P0"])
    ampl.get_parameter("P").set_values(api_data["P"])
    ampl.get_parameter("C_fix").set_values(api_data["C_fix"])
    ampl.get_parameter("Demand").set_values(api_data["Demand"])
    ampl.get_parameter("S_avail").set_values(api_data["S_avail"])
    ampl.get_parameter("LT").set_values(api_data["LT"])

    if "H_arrival" in api_data:
        ampl.get_parameter("H_arrival").set_values(api_data["H_arrival"])

    ampl.set_option("solver", "cbc")
    ampl.solve()

    results = {t: {d: 0.0 for d in api_data["D"]} for t in api_data["T"]}

    if ampl.get_value("solve_result") == "solved":
        x0_vals = ampl.get_variable("x0").get_values().to_dict()
        x_vals = ampl.get_variable("x").get_values().to_dict()

        for (d, b, t), val in x0_vals.items():
            if val > 0.001:
                results[t][d] += val

        for (d, b, t, lvl), val in x_vals.items():
            if val > 0.001:
                results[t][d] += val

    return dict(results)


mock_api_data = {
    "T": [1, 2, 3, 4, 5, 6, 7],
    "D": ["D1", "D2"],
    "B": ["B1", "B2"],
    "L": [1, 2],
    "alpha": 0.05,
    "V_max": {"B1": 50, "B2": 75},
    "Q": {1: 30, 2: 60},
    "I0": {"B1": 19.0, "B2": 32.0},
    "P0": {
        (d, t): (12.0 if d == "D1" else 11.0)
        for d in ["D1", "D2"]
        for t in [1, 2, 3, 4, 5, 6, 7]
    },
    "P": {
        (d, t, lvl): (
            10.0
            if (d == "D1" and lvl == 1)
            else (
                8.0
                if (d == "D1" and lvl == 2)
                else 9.5
                if (d == "D2" and lvl == 1)
                else 7.5
            )
        )
        for d in ["D1", "D2"]
        for t in [1, 2, 3, 4, 5, 6, 7]
        for lvl in [1, 2]
    },
    "C_fix": {("D1", "B1"): 50, ("D1", "B2"): 50, ("D2", "B1"): 60, ("D2", "B2"): 60},
    "Demand": {
        (b, t): (15.0 if b == "B1" else 12.0)
        for b in ["B1", "B2"]
        for t in [1, 2, 3, 4, 5, 6, 7]
    },
    "S_avail": {(d, t): 100 for d in ["D1", "D2"] for t in [1, 2, 3, 4, 5, 6, 7]},
    "LT": {("D1", "B1"): 1, ("D2", "B1"): 2, ("D1", "B2"): 1, ("D2", "B2"): 2},
    "H_arrival": {("D1", "B1", 1): 25.0},
}

if __name__ == "__main__":
    result = solve_coffee_optimization(mock_api_data)
    print(result)
