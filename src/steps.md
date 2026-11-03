# TLB

## Next steps

* Look into publishing as GH pages
* Look into using bookmarklet a la Flakers
* Add fetch calls for
    * Profile - check if has store, etc
    * List of reports?
    * Inventory snapshot
    * Orders
* Edge case: Check for snapshot validity across order date range
    * Pull begin and end dates and compare. Initially, just fail if differ; eventually scan for change date(s)
* Classes for:
    * single order
    * inventory item and list
        * look up by name
* Parse inventory response into list
* Parse order response in list of transactions
    * Look for packed orders (multiple products per response item)
    * Look for packed payments
        * Calculate using rules (transaction fee, tax % for type, etc)

