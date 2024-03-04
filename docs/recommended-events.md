# Recommended Events

_Barnebys recommends implementing the following events in order to gain insight into traffic and conversions_

## Auction House Events

|  EventCategory | eventAction | eventLabel | eventValue | eventCurrency |
| --- | --- | --- | --- | --- |
| **bid** | <ul><li>submit</li><li>placed</li><li>winning</li><li>underbid</li></ul> | _Unique identifier of the event<br>e.g 'Item name' or 'item id'_ | _The value of the final bid/hammer price<br>e.g. ‘1000.00’_ | _The currency of the final bid/hammer price<br>e.g. ‘EUR’_ |
| **purchase** | <ul><li>start</li><li>completed</li></ul> | _Unique identifier of the event<br>e.g. 'Invoice number'_ | _The total value of the purchase<br>e.g. ‘1000.00’_ | _The currency the purchase was listed in<br>e.g. ‘EUR’_ | 
| **registration** | <ul><li>start</li><li>completed</li></ul> | not applicable | not applicable | not applicable |


#### bid eventActions 
* submit: _The intent to bid i.e. clicking on the “Bid” button_
* placed: _The successful receipt of a bid i.e. bid accepted by system_
* winning: _Tagging of a winning bid i.e. triggered event on auction close or invoice generation_
* underbid: _Tagging of the second highest bid i.e. triggered event on auction close or invoice generation_

#### purchase eventActions
* start: _The intent to pay i.e. navigating to the checkout or payment page (clicking the “Pay”/”Checkout” link)_
* completed: _The purchase process has been completed i.e. a successful payment has been received_
  
#### registration eventActions
* start: _The intent to register i.e. navigating to the registration page (clicking the “Register” link)_
* completed: _The registration process has been completed i.e. form submitted (even if not yet approved by the client)_
  

## Dealer/Gallery Events

|  EventCategory | eventAction | eventLabel | eventValue | eventCurrency |
| --- | --- | --- | --- | --- |
| **addtoCart** | <ul><li>submit</li><li>placed</li></ul> | _Unique identifier of the event<br>e.g 'Item name' or 'item id'_ | _The value of the final bid/hammer price<br>e.g. ‘1000.00’_ | _The currency of the final bid/hammer price<br>e.g. ‘EUR’_ |
| **purchase** | <ul><li>start</li><li>completed</li></ul> | _Unique identifier of the event<br>e.g. 'Invoice number'_ | _The total value of the purchase<br>e.g. ‘1000.00’_ | _The currency the purchase was listed in<br>e.g. ‘EUR’_ | 
| **registration** | <ul><li>start</li><li>completed</li></ul> | not applicable | not applicable | not applicable |

#### addtoCart eventActions 
* submit: _The intent to purchase i.e. clicking on the “Add to Cart” button _
* placed: _The successful receipt of an add to cart action bid i.e. accepted by system_

#### purchase eventActions
* start: _The intent to pay i.e. navigating to the checkout or payment page (clicking the “Pay”/”Checkout” link)_
* completed: _The purchase process has been completed i.e. a successful payment has been received_
  
#### registration eventActions
* start: _The intent to register i.e. navigating to the registration page (clicking the “Register” link)_
* completed: _The registration process has been completed i.e. form submitted (even if not yet approved by the client)_
