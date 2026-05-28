-- Seed data: 20 Distributors, 4 Buildings, 30-day horizon, admin user
-- Idempotent: re-running will not duplicate rows.
--
-- Apply with:
--   docker compose exec -T db psql -U coffee_user -d coffee_db < new_rich_seed.sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 0. ADMIN USER  (login: admin / password: admin123)
-- ON CONFLICT (name): if 'admin' already exists, just ensure the role is 'admin'
INSERT INTO users (id, name, password_hash, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',
   crypt('admin123', gen_salt('bf', 12)), 'admin')
ON CONFLICT (name) DO NOTHING;

-- 1. DISTRIBUTORS (20 distinct coffee suppliers)
INSERT INTO distributors (id, username, contact_email, contact_phone, active) VALUES
  ('d0000001-1111-1111-1111-000000000001', 'arabica_premium_warsaw',  'sales@arabica-premium.pl',   '+48111000111', true),
  ('d0000002-2222-2222-2222-000000000002', 'robusta_mass_supply',      'bulk@robusta-mass.com',       '+48222000222', true),
  ('d0000003-3333-3333-3333-000000000003', 'krakow_roastery_ltd',      'roast@krk-roast.pl',          '+48333000333', true),
  ('d0000004-4444-4444-4444-000000000004', 'global_coffee_corp',       'logistics@global-coffee.com', '+48444000444', true),
  ('d0000005-5555-5555-5555-000000000005', 'eco_bean_suppliers',       'eco@bean.pl',                 '+48555000555', true),
  ('d0000006-6666-6666-6666-000000000006', 'fast_ship_coffee',         'orders@fastship.pl',          '+48666000666', true),
  ('d0000007-7777-7777-7777-000000000007', 'budget_beans_wholesale',   'wholesale@budgetbeans.pl',    '+48777000777', true),
  ('d0000008-8888-8888-8888-000000000008', 'artisanal_brew_co',        'brew@artisanal.com',          '+48888000888', true),
  ('d0000009-9999-9999-9999-000000000009', 'mountain_grown_imports',   'imports@mountain.pl',         '+48999000999', true),
  ('d0000010-0000-0000-0000-000000000010', 'city_roast_solutions',     'city@roast.pl',               '+48101000101', true),
  ('d0000011-1111-1111-1111-000000000011', 'ethiopian_gold_distro',    'gold@ethiopian.com',          '+48111222333', true),
  ('d0000012-2222-2222-2222-000000000012', 'direct_trade_experts',     'expert@directtrade.pl',       '+48121222333', true),
  ('d0000013-3333-3333-3333-000000000013', 'coffee_express_gdansk',    'gdansk@coffee-express.pl',    '+48131222333', true),
  ('d0000014-4444-4444-4444-000000000014', 'morning_fuel_roastery',    'morning@fuel.pl',             '+48141222333', true),
  ('d0000015-5555-5555-5555-000000000015', 'bean_voyage_intl',         'intl@beanvoyage.com',         '+48151222333', true),
  ('d0000016-6666-6666-6666-000000000016', 'wroclaw_coffee_works',     'works@wroclawcoffee.pl',      '+48161222333', true),
  ('d0000017-7777-7777-7777-000000000017', 'dark_roast_specialists',   'dark@specialists.pl',         '+48171222333', true),
  ('d0000018-8888-8888-8888-000000000018', 'blue_mountain_luxury',     'luxury@bluemountain.com',     '+48181222333', true),
  ('d0000019-9999-9999-9999-000000000019', 'discount_coffee_depot',    'depot@discountcoffee.pl',     '+48191222333', true),
  ('d0000020-0000-0000-0000-000000000020', 'sunrise_blends_co',        'sunrise@blends.pl',           '+48202222333', true),
  ('d0000021-1111-1111-1111-000000000021', 'northern_roast_co',        'info@northernroast.pl',       '+48212222333', true),
  ('d0000022-2222-2222-2222-000000000022', 'baltic_bean_imports',      'imports@balticbean.pl',       '+48222222333', true),
  ('d0000023-3333-3333-3333-000000000023', 'silesia_coffee_hub',       'hub@silesiacoffee.pl',        '+48232222333', true),
  ('d0000024-4444-4444-4444-000000000024', 'tatra_brew_specialists',   'brew@tatrabrew.pl',           '+48242222333', true),
  ('d0000025-5555-5555-5555-000000000025', 'mazovian_coffee_supply',   'supply@mazovian.pl',          '+48252222333', true),
  ('d0000026-6666-6666-6666-000000000026', 'lublin_roastery_experts',  'expert@lublinroast.pl',       '+48262222333', true),
  ('d0000027-7777-7777-7777-000000000027', 'poznan_bean_traders',      'traders@poznanbean.pl',       '+48272222333', true),
  ('d0000028-8888-8888-8888-000000000028', 'lodz_coffee_works',        'works@lodzcoffee.pl',         '+48282222333', true),
  ('d0000029-9999-9999-9999-000000000029', 'szczecin_sea_brew',        'sea@szczecinbrew.pl',         '+48292222333', true),
  ('d0000030-0000-0000-0000-000000000030', 'bialystok_forest_roast',   'forest@bialystokroast.pl',    '+48302222333', true)
ON CONFLICT (id) DO UPDATE SET active = EXCLUDED.active;

-- 2. BUILDINGS (6 Locations)
INSERT INTO buildings (id, name, location, max_capacity_kg, initial_inventory_kg, current_inventory_kg) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Warsaw Tower HQ',       'Warszawa, Al. Jerozolimskie 1', 250.00, 45.00, 45.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Krakow Innovation Hub', 'Kraków, ul. Wielicka 28',        150.00, 20.00, 20.00),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Wroclaw Tech Park',     'Wrocław, ul. Muchoborska 12',    120.00, 15.00, 15.00),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Gdansk Sea Office',     'Gdańsk, ul. Grunwaldzka 412',    200.00, 30.00, 30.00),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Poznan Innovation Center', 'Poznań, ul. Roosevelta 22',   180.00, 25.00, 25.00),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Lodz Creative Hub',      'Łódź, ul. Piotrkowska 100',      160.00, 22.00, 22.00)
ON CONFLICT (id) DO UPDATE SET
  max_capacity_kg      = EXCLUDED.max_capacity_kg,
  initial_inventory_kg = EXCLUDED.initial_inventory_kg;

-- 3. PRICES & TIERS for all 30 planning days — varied per distributor category
DO $$
DECLARE
    d_record    RECORD;
    day_idx     INT;
    dow         INT;  -- day-of-week 1=Mon … 7=Sun
    base_p      DECIMAL;
    tier1_qty   DECIMAL;
    tier2_qty   DECIMAL;
    disc1       DECIMAL;
    disc2       DECIMAL;
    price_today DECIMAL;
    avail_today DECIMAL;
BEGIN
    FOR d_record IN SELECT id, username FROM distributors LOOP

        -- Per-distributor offer profile (base price, tier thresholds, discounts)
        IF d_record.username IN ('arabica_premium_warsaw', 'blue_mountain_luxury') THEN
            base_p := 68.00; tier1_qty := 40.00; tier2_qty := 90.00; disc1 := 0.93; disc2 := 0.87;
        ELSIF d_record.username IN ('ethiopian_gold_distro', 'artisanal_brew_co') THEN
            base_p := 62.00; tier1_qty := 35.00; tier2_qty := 80.00; disc1 := 0.92; disc2 := 0.85;
        ELSIF d_record.username IN ('mountain_grown_imports', 'bean_voyage_intl') THEN
            base_p := 58.00; tier1_qty := 35.00; tier2_qty := 75.00; disc1 := 0.91; disc2 := 0.84;
        ELSIF d_record.username IN ('budget_beans_wholesale', 'discount_coffee_depot') THEN
            base_p := 33.00; tier1_qty := 20.00; tier2_qty := 55.00; disc1 := 0.96; disc2 := 0.91;
        ELSIF d_record.username IN ('global_coffee_corp', 'fast_ship_coffee', 'coffee_express_gdansk') THEN
            base_p := 50.00; tier1_qty := 30.00; tier2_qty := 70.00; disc1 := 0.91; disc2 := 0.84;
        ELSIF d_record.username IN ('eco_bean_suppliers', 'direct_trade_experts') THEN
            base_p := 52.00; tier1_qty := 30.00; tier2_qty := 65.00; disc1 := 0.90; disc2 := 0.83;
        ELSIF d_record.username IN ('dark_roast_specialists', 'morning_fuel_roastery') THEN
            base_p := 47.00; tier1_qty := 25.00; tier2_qty := 65.00; disc1 := 0.92; disc2 := 0.86;
        ELSE
            base_p := 45.00; tier1_qty := 30.00; tier2_qty := 70.00; disc1 := 0.92; disc2 := 0.85;
        END IF;

        FOR day_idx IN 1..30 LOOP
            dow := ((day_idx - 1) % 7) + 1;

            IF dow IN (6, 7) THEN
                -- Weekend: higher price, lower stock
                price_today := ROUND(base_p * 1.04 + (day_idx::DECIMAL / 30.0) * 2.0, 2);
                avail_today := 55.00 + (dow - 5) * 15;
            ELSE
                -- Weekday: mild weekly climb + slow 30-day trend
                price_today := ROUND(base_p + (dow * 0.30) + (day_idx::DECIMAL / 30.0) * 2.0, 2);
                avail_today := 110.00 + (6 - dow) * 12;
            END IF;

            INSERT INTO distributor_daily_prices (distributor_id, day, base_price, availability_kg)
            VALUES (d_record.id, day_idx, price_today, avail_today)
            ON CONFLICT DO NOTHING;

            INSERT INTO distributor_discount_tiers (distributor_id, day, level, quantity_kg, unit_price)
            VALUES (d_record.id, day_idx, 1, tier1_qty, ROUND(price_today * disc1, 2))
            ON CONFLICT DO NOTHING;

            INSERT INTO distributor_discount_tiers (distributor_id, day, level, quantity_kg, unit_price)
            VALUES (d_record.id, day_idx, 2, tier2_qty, ROUND(price_today * disc2, 2))
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 4. DELIVERY PARAMS — 6 curated distributors per building (keeps MILP tractable)
--    Each building uses its local specialist + 5 national suppliers.
--    Distributors without params for a building are handled by AMPL defaults (cost = 1e9).
DELETE FROM delivery_params;

INSERT INTO delivery_params
  (distributor_id, building_id, lead_time_days, fixed_cost_pln, correction_cost_per_kg, max_correction_kg)
VALUES
  -- Warsaw Tower HQ: arabica_premium, robusta_mass, global_corp, fast_ship, budget_beans, ethiopian_gold
  ('d0000001-1111-1111-1111-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 50.00, 2.50, 35.0),
  ('d0000002-2222-2222-2222-000000000002','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 25.00, 2.00, 40.0),
  ('d0000004-4444-4444-4444-000000000004','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 30.00, 2.50, 35.0),
  ('d0000006-6666-6666-6666-000000000006','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 35.00, 3.00, 30.0),
  ('d0000007-7777-7777-7777-000000000007','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 15.00, 1.50, 50.0),
  ('d0000011-1111-1111-1111-000000000011','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 45.00, 2.50, 30.0),
  -- Krakow Innovation Hub: krakow_roastery, eco_bean, city_roast, direct_trade, morning_fuel, discount_depot
  ('d0000003-3333-3333-3333-000000000003','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 18.00, 2.00, 25.0),
  ('d0000005-5555-5555-5555-000000000005','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 28.00, 2.00, 30.0),
  ('d0000010-0000-0000-0000-000000000010','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 30.00, 2.00, 25.0),
  ('d0000012-2222-2222-2222-000000000012','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 32.00, 2.50, 25.0),
  ('d0000014-4444-4444-4444-000000000014','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 25.00, 2.00, 28.0),
  ('d0000019-9999-9999-9999-000000000019','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 12.00, 1.50, 40.0),
  -- Wroclaw Tech Park: wroclaw_works, budget_beans, artisanal_brew, mountain_grown, dark_roast, sunrise_blends
  ('d0000016-6666-6666-6666-000000000016','cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 20.00, 2.00, 22.0),
  ('d0000007-7777-7777-7777-000000000007','cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 12.00, 1.50, 30.0),
  ('d0000008-8888-8888-8888-000000000008','cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 35.00, 2.50, 20.0),
  ('d0000009-9999-9999-9999-000000000009','cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 40.00, 3.00, 18.0),
  ('d0000017-7777-7777-7777-000000000017','cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 28.00, 2.00, 22.0),
  ('d0000020-0000-0000-0000-000000000020','cccccccc-cccc-cccc-cccc-cccccccccccc', 2, 22.00, 2.00, 20.0),
  -- Gdansk Sea Office: coffee_express, robusta_mass, global_corp, city_roast, bean_voyage, blue_mountain
  ('d0000013-3333-3333-3333-000000000013','dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 22.00, 3.00, 40.0),
  ('d0000002-2222-2222-2222-000000000002','dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 25.00, 2.00, 45.0),
  ('d0000004-4444-4444-4444-000000000004','dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 28.00, 2.50, 40.0),
  ('d0000010-0000-0000-0000-000000000010','dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 30.00, 2.00, 35.0),
  ('d0000015-5555-5555-5555-000000000015','dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 38.00, 2.50, 35.0),
  ('d0000018-8888-8888-8888-000000000018','dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 60.00, 3.00, 25.0),
  -- Poznan Innovation Center: poznan_bean, northern_roast, baltic_bean, eco_bean, direct_trade, global_corp
  ('d0000027-7777-7777-7777-000000000027','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, 22.00, 2.00, 28.0),
  ('d0000021-1111-1111-1111-000000000021','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 30.00, 2.50, 25.0),
  ('d0000022-2222-2222-2222-000000000022','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 28.00, 2.20, 30.0),
  ('d0000005-5555-5555-5555-000000000005','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 35.00, 2.00, 25.0),
  ('d0000012-2222-2222-2222-000000000012','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 25.00, 2.00, 30.0),
  ('d0000004-4444-4444-4444-000000000004','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 40.00, 3.00, 20.0),
  -- Lodz Creative Hub: lodz_coffee, mazovian_coffee, lublin_roastery, dark_roast, morning_fuel, artisanal_brew
  ('d0000028-8888-8888-8888-000000000028','ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 18.00, 1.80, 26.0),
  ('d0000025-5555-5555-5555-000000000025','ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 24.00, 2.00, 30.0),
  ('d0000026-6666-6666-6666-000000000026','ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 28.00, 2.20, 25.0),
  ('d0000017-7777-7777-7777-000000000017','ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 32.00, 2.50, 20.0),
  ('d0000014-4444-4444-4444-000000000014','ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 25.00, 2.00, 28.0),
  ('d0000008-8888-8888-8888-000000000008','ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 40.00, 3.00, 15.0)
ON CONFLICT (distributor_id, building_id) DO UPDATE SET
  lead_time_days          = EXCLUDED.lead_time_days,
  fixed_cost_pln          = EXCLUDED.fixed_cost_pln,
  correction_cost_per_kg  = EXCLUDED.correction_cost_per_kg,
  max_correction_kg       = EXCLUDED.max_correction_kg;

-- 5. BUILDING DAILY DEMAND (30 days, realistic Mon–Sun weekly pattern)
DO $$
DECLARE
    b_record    RECORD;
    day_idx     INT;
    dow         INT;
    base_dem    DECIMAL;
    demand      DECIMAL;
BEGIN
    FOR b_record IN SELECT id, name FROM buildings LOOP

        IF    b_record.name = 'Warsaw Tower HQ'       THEN base_dem := 12.0;
        ELSIF b_record.name = 'Krakow Innovation Hub' THEN base_dem :=  7.5;
        ELSIF b_record.name = 'Wroclaw Tech Park'     THEN base_dem :=  6.5;
        ELSIF b_record.name = 'Gdansk Sea Office'     THEN base_dem := 10.0;
        ELSIF b_record.name = 'Poznan Innovation Center' THEN base_dem :=  9.0;
        ELSIF b_record.name = 'Lodz Creative Hub'      THEN base_dem :=  8.0;
        ELSE  base_dem := 8.0;
        END IF;

        FOR day_idx IN 1..30 LOOP
            dow := ((day_idx - 1) % 7) + 1;

            CASE dow
                WHEN 1 THEN demand := ROUND(base_dem * 0.85, 3);  -- Mon
                WHEN 2 THEN demand := ROUND(base_dem * 1.00, 3);  -- Tue
                WHEN 3 THEN demand := ROUND(base_dem * 1.10, 3);  -- Wed
                WHEN 4 THEN demand := ROUND(base_dem * 1.05, 3);  -- Thu
                WHEN 5 THEN demand := ROUND(base_dem * 1.20, 3);  -- Fri (peak)
                WHEN 6 THEN demand := ROUND(base_dem * 0.35, 3);  -- Sat
                ELSE        demand := ROUND(base_dem * 0.25, 3);  -- Sun
            END CASE;

            INSERT INTO building_daily_demand (building_id, day, demand_kg)
            VALUES (b_record.id, day_idx, demand)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

COMMIT;
