# Nest

This repository contains a script for extracting daily hours of heat from a Nest thermostat [data request](#data-request).

The Nest data request currently provides a list of heating events or cycles for each day, without daily totals. The script aims to sum these events up into a total number of hours of heat for each day and provide a CSV file of this data for convenient analysis.

The resultant data could be useful for correlating hours of heating (or cooling) with outside temperature and other factors like added insulation, better windows, etc.

**Warning:** This doesn't currently work because the Nest data export is [inaccurate](#known-issues).

## Setup

### Data Request

Request Nest JSON/CSV data to be emailed to you within a few days from: <https://takeout.google.com>

### Repository

Retrieve this repository:

```sh
git clone ...
```

From inside the repository folder:

```sh
npm install
```

```sh
npm run build
```

## Usage

Run the following command from inside this project folder.

```sh
PATH_DATA_EXPORT=./data-export-123/2024-01-summary.json npm run generate
```

See the outputted files:

* `days.csv`
* `days-corrected-for-timezone.csv` - a failed attempt to correct for the local timezone (use `TIMEZONE` environment variable to customize), getting some days with greater than 24 hours of heat for example

## Known Issues

1. The Nest [data export](#data-request) has inaccurate or incomplete data. The number of hours of daily heat calculated from the downloaded summary does not match the numbers in the 10-day energy history provided in the Nest app. And the provided `totalHeatingSeconds` property is always zero. More info from others who experienced this same issue in this [thread](https://www.googlenestcommunity.com/t5/Nest-Thermostats/download-nest-thermostat-data/td-p/45703).
2. Currently, the scripts only focus on heating.

## Related Links

* <https://www.reddit.com/r/Nest/comments/z3mob7/is_there_a_way_to_how_long_the_learning/>
* <https://www.reddit.com/r/Nest/comments/aarx1x/more_than_10_days_of_energy_history/>
* <https://www.instructables.com/Nest-Thermostat-Data-Logger/>
