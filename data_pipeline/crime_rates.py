"""
Loads council-level (LGA) recorded-offence rates from the Crime Statistics
Agency (CSA) Victoria "LGA Recorded Offences" release (Table 01: offences
recorded and rate per 100,000 population, by police region and LGA), for
the most recent year-ending period in the file.

CSA only publishes a *rate* at LGA/council granularity — suburb-level CSA
data (their Table 03) is offence *counts* only, with no population
denominator, so it can't be turned into a comparable rate without
inventing a population split ourselves. Every suburb in this dataset
therefore gets its *council's* rate, not a suburb-specific one — see the
`crime.granularity` field this produces (build_master_dataset.py) and
docs/data-fields.md.

Handles the 2022 Moreland -> Merri-bek council rename: this pipeline's LGA
boundary vintage (2021, see melbourne_suburbs.py) still uses "Moreland",
but CSA's current data already uses "Merri-bek" for the same council.

Source file expected at ../data/newData/ (outside this repo, same
convention as the ABS Census/shapefile inputs — see data_pipeline/README.md):
CSA_LGA_Recorded_Offences_YearEndingMar2026.xlsx, downloaded from
https://www.crimestatistics.vic.gov.au/crime-statistics/latest-victorian-crime-data/download-data
("Data Tables LGA Recorded Offences Year Ending March 2026").
"""

from pathlib import Path

import openpyxl

CSA_XLSX_PATH = (
    Path(__file__).resolve().parent.parent.parent
    / "data" / "newData" / "CSA_LGA_Recorded_Offences_YearEndingMar2026.xlsx"
)

CSA_SOURCE_LABEL = "Crime Statistics Agency (CSA) Victoria"
CSA_PERIOD_LABEL = "Year ending March 2026"

# CSA's current data already uses the post-2022 council name; our LGA
# boundary vintage (2021, see melbourne_suburbs.py) has not been updated.
CSA_NAME_TO_COUNCIL = {"Merri-bek": "Moreland"}

# Rows in Table 01 that are totals or not an actual council — never treated
# as a council's own rate.
NON_COUNCIL_ROWS = {"Total", "Unincorporated Vic", "Justice Institutions and Immigration Facilities"}


def load_crime_rates(target_year=2026, target_year_ending="March"):
    """Returns {council_name: rate_per_100k} for the target period, one
    entry per Victorian LGA in the source file. council_name matches the
    display names used elsewhere in this pipeline (melbourne_suburbs.py's
    METRO_MELBOURNE_COUNCILS with "(Vic.)" stripped and the Merri-bek
    rename reversed), not necessarily CSA's own current spelling."""
    wb = openpyxl.load_workbook(CSA_XLSX_PATH, read_only=True, data_only=True)
    ws = wb["Table 01"]
    rows = ws.iter_rows(values_only=True)
    header = next(rows)
    expected_header = ("Year", "Year ending", "Police Region", "Local Government Area", "Offence Count", "Rate per 100,000 population")
    if header != expected_header:
        raise RuntimeError(f"Table 01 header changed, update crime_rates.py: {header}")

    rates = {}
    for year, year_ending, _region, lga_name, _count, rate in rows:
        if year != target_year or year_ending != target_year_ending:
            continue
        if lga_name is None:
            continue
        name = lga_name.strip()
        if name in NON_COUNCIL_ROWS:
            continue
        council_name = CSA_NAME_TO_COUNCIL.get(name, name)
        rates[council_name] = rate

    return rates


if __name__ == "__main__":
    from melbourne_suburbs import METRO_MELBOURNE_COUNCILS

    our_councils = {name.replace(" (Vic.)", "") for name in METRO_MELBOURNE_COUNCILS}
    rates = load_crime_rates()

    print(f"Loaded rates for {len(rates)} Victorian LGAs from {CSA_XLSX_PATH.name}")
    print(f"Period: {CSA_PERIOD_LABEL}\n")

    missing = our_councils - set(rates)
    print(f"Our 31 councils matched: {len(our_councils - missing)} / {len(our_councils)}")
    if missing:
        print(f"MISSING (no rate found): {sorted(missing)}")
    else:
        print("All 31 councils matched.\n")
        for name in sorted(our_councils):
            print(f"  {name:22s} {rates[name]:>10.1f} / 100k")
