# Lumino data pack, Vibe Coders Hackathon Edition 3

Read this first. It takes five minutes and saves you an hour.

This is one real Lumino project. Lumino built power lines across six districts around Kanpur. The data runs from March 2023 to October 2026.

It covers 16 items and 6 godowns. A godown is a store. Each district has one.

## What is in this pack

| File | One row is | Rows |
|---|---|---|
| `brief/Lumino_problem_statement.pdf` | The problem statement. Read it before the data. |  |
| `csv/items.csv` | An item, with its lead time | 16 |
| `csv/sets.csv` | A set and one item it needs | 8 |
| `csv/receipts.csv` | Material arriving at a godown from a vendor | 2,600 |
| `csv/contractor_moves.csv` | Material going to a contractor, coming back, or being used | 2,31,076 |
| `csv/transfers.csv` | Material moving between stores | 1,446 |
| `csv/data_dictionary.csv` | Every column explained | 23 |
| `lumino_data.xlsx` | The same files as tabs in one Excel file. Separate download. |  |

`item_code` joins every file.

## How material moves

1. Lumino orders an item. It arrives after the lead time. That arrival is a row in `receipts`.
2. It sits in a godown.
3. The godown gives it to a contractor. That is an ISSUE.
4. The contractor uses it at site. That is a CONSUMPTION.
5. What the contractor does not use may come back. That is a RETURN.
6. Godowns also send stock to each other. That is a transfer, OUT of one store and IN to another.

So stock can sit idle in two places: in the godown, and with the contractor.

## The two sums you need

Stock in a godown on any day:

`receipts + transfers IN - transfers OUT - ISSUE + RETURN`

Stock lying with contractors on any day:

`ISSUE - RETURN - CONSUMPTION`

Add everything up to that day. The project starts with zero stock.

## Things people get wrong

1. CONSUMPTION rows have no godown. Lumino records usage for the whole project, not per district. So stock in godowns can be tracked per godown. Stock with contractors can only be tracked for the whole project.
2. Rows that look identical are separate entries. Do not remove duplicates.
3. `qty` is always positive. `type` or `direction` tells you which way it moved.
4. Some rows have a quantity of 0. They are as Lumino sent them. Ignore them.
5. Each item has one unit. Check `items.csv`. G.I. nuts and bolts are in tonnes (MT), so the numbers are small decimals. One cable is in kilometres, the other in metres.
6. Transfers OUT and IN do not add up to the same total. Some stock went to stores outside this project, and some came in from outside.
7. `KANPUR CLOSER` is the closing store. Leftover stock was sent there when the project wound up in 2026. It only appears in transfers.
8. In a few godowns the stock sum dips a little below zero for a few days. That is an entry made late. Treat it as zero.
9. There are no order dates. To get the day an order must have been placed, take the receipt date and go back by the lead time.
10. There are no prices. Count in quantities, item by item.
11. Receipts stop in July 2026. Usage carries on till October 2026.

## The sets

Three items are sets. They are marked Parent in `items.csv`. `sets.csv` lists what each one needs.

- POLE CLAMP RDSS needs an eye hook and three kinds of nuts and bolts.
- The single phase distribution box needs lugs and nuts and bolts.
- The three phase distribution box needs ring type lugs and nuts and bolts.

G.I. nuts and bolts are needed by all three sets. They are shared.

`sets.csv` has a column called `ratio_of_parent`. It is Lumino's own ratio for each child against its parent, exactly as Lumino gave it. Use it to check whether a set is in balance.

Before you rely on it, compare it with what the site actually used. If the two do not agree for an item, ask Lumino's person in the room how to read the ratio for that item.

## Loading it

- `contractor_moves.csv` has about 2.3 lakh rows. Do not paste it into a chat window. Upload the file, or load it with code.
- In Python: `pandas.read_csv("csv/contractor_moves.csv", parse_dates=["date"])`
- Dates are written year, month, day, like 2023-04-10.
- For most questions, first add the rows up by item, godown and month. That table is small and easy to work with.

## Questions

Ask Lumino's person in the room or any crew member with a black CREW card.

Data belongs to Lumino Industries Limited. Calcutta AI Club renamed the columns, fixed the date format and put each item on one unit. No quantity was changed.
