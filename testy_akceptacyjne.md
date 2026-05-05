# Testy akceptacyjne

PZSP2 | Zespół nr 67 | Semestr 26L

---

## Logowanie do systemu

**Wymagania:** S9, U12

**Cel:** Sprawdzenie, czy tylko uprawniony Koordynator może się zalogować.

**Kroki:**
1. Wejdź na stronę logowania.
2. Wpisz poprawny login i hasło -> zatwierdź.
3. Powtórz z błędnym hasłem.

**Oczekiwany wynik:** Poprawne dane, dostęp do panelu. Błędne dane, komunikat o błędzie, brak dostępu.

---

## Dodanie oferty przez Dystrybutora

**Wymagania:** S4, S5, U4

**Cel:** Weryfikacja, czy Dystrybutor może dodać nową ofertę do bazy.

**Kroki:**
1. Zaloguj się jako Dystrybutor.
2. Wypełnij formularz oferty.
3. Zapisz ofertę.

**Oczekiwany wynik:** Oferta pojawia się na liście ofert widocznej dla Koordynatora.

---

## Wybór optymalnej oferty

**Wymagania:** S2, U7

**Cel:** Sprawdzenie, czy algorytm zwraca ofertę najlepiej dopasowaną do podanych parametrów.

**Kroki:**
1. Koordynator ustawia budżet, termin i wymaganą jakość.
2. Uruchamia algorytm wyboru oferty.

**Oczekiwany wynik:** System wskazuje ofertę mieszczącą się w budżecie, spełniającą wymagania jakościowe i dostarczaną na czas.

---

## Walidacja formularza parametrów

**Wymagania:** S10, U1, U2

**Cel:** Upewnienie się, że system nie przyjmuje niepoprawnych danych wejściowych.

**Kroki:**
1. W formularzu zamówienia wpisz datę z przeszłości oraz ujemny budżet.
2. Spróbuj zapisać formularz.

**Oczekiwany wynik:** System wyświetla komunikaty błędów i blokuje zapis do czasu poprawienia danych.

---

## Przeglądanie ofert przy dużej ich liczbie

**Wymagania:** S7, U3

**Cel:** Weryfikacja płynności interfejsu przy wielu ofertach w bazie.

**Kroki:**
1. Załaduj bazę z co najmniej 500 ofertami.
2. Otwórz listę ofert.
3. Przewijaj strony i filtruj wyniki.

**Oczekiwany wynik:** Lista ładuje się w rozsądnym czasie (poniżej 2 s), interfejs nie zawiesza się, paginacja działa poprawnie.

---

## Generowanie harmonogramu zamówień

**Wymagania:** S2, S11, U10

**Cel:** Sprawdzenie, czy system poprawnie generuje przewidywany plan zamówień na zadany okres.

**Kroki:**
1. Koordynator ustawia zakres czasowy i parametry.
2. Klika „Generuj harmonogram".
3. Przegląda wygenerowany wynik.

**Oczekiwany wynik:** System wyświetla listę zamówień z datami i dostawcami, zgodną z podanym budżetem i wolumenem. Brak sprzeczności z ograniczeniami.

---

## Zarządzanie lokalizacjami i stanami magazynowymi

**Wymagania:** S13, U5, U8, U13

**Cel:** Weryfikacja, czy Koordynator może przeglądać i ustawiać limity magazynowe dla różnych lokalizacji.

**Kroki:**
1. Przejdź do widoku magazynów.
2. Dodaj nową lokalizację.
3. Ustaw limit magazynowy.
4. Sprawdź aktualny stan kawy w tej lokalizacji.

**Oczekiwany wynik:** Lokalizacja widoczna na liście, limit zapisany, stan magazynowy wyświetla się poprawnie. Przekroczenie limitu sygnalizowane jest w interfejsie.

---

## Blokada dostępu do chronionych widoków bez logowania

**Wymagania:** S9, U12

**Cel:** Sprawdzenie, czy niezalogowany użytkownik nie może uzyskać dostępu do chronionych części systemu przez bezpośrednie wpisanie adresu URL.

**Kroki:**
1. Wyloguj się z systemu albo otwórz aplikację w trybie incognito.
2. Spróbuj wejść bezpośrednio na widok panelu głównego, np. dashboard.
3. Spróbuj wejść bezpośrednio na widok ofert lub historii zamówień.
4. Spróbuj odświeżyć chroniony widok po wcześniejszym wylogowaniu.

**Oczekiwany wynik:** System nie pokazuje danych aplikacji niezalogowanemu użytkownikowi. Użytkownik zostaje przekierowany na stronę logowania albo otrzymuje komunikat o braku dostępu.

---

## Historia zrealizowanych zamówień

**Wymagania:** S11, U10, U13

**Cel:** Sprawdzenie, czy system zapisuje i poprawnie wyświetla historię zrealizowanych zamówień.

**Kroki:**
1. Zaloguj się jako Koordynator.
2. Ustaw parametry zamówienia i uruchom wybór optymalnej oferty.
3. Zatwierdź wybraną ofertę.
4. Oznacz zamówienie jako zrealizowane albo przejdź przez podstawowy scenariusz realizacji zamówienia.
5. Przejdź do widoku historii zamówień.

**Oczekiwany wynik:** Zrealizowane zamówienie znajduje się w historii i zawiera co najmniej datę, dostawcę, cenę, wolumen, lokalizację oraz status realizacji.
