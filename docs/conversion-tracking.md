## Adding Barnebys Analytics to your site

The bite.js library is a JavaScript library for measuring how Barnebys users interact 
with your website. This document explains how to add bite.js to your site.

## The JavaScript measurement snippet

Adding the following code (known as the "JavaScript measurement snippet")
to your site's templates is the easiest way to get started using bite.js.

The code should be added near the top of the `<head>` tag and before any 
other script or CSS tags. Replace the string `BA_PROGRAM_ID` with your program id supplied by Barnebys.

```
<!-- Barnebys Analytics -->
<script>
  (function(i,s,o,g,r,a,m){
      i['BarnebysAnalyticsObject']=r;
      i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();
      a=s.createElement(o),m=s.getElementsByTagName(o)[0];
      a.async=1;
      a.src=g;
      m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://analytics.barnebys.sh/bite.v1.js','ba');

  ba('init', 'BA_PROGRAM_ID');
</script>
<!-- End Barnebys Analytics -->
``` 

### The above code does four main things:

1. Creates a `<script>` element that starts asynchronously downloading the bite.js 
   JavaScript library from https://analytics.barnebys.sh/bite.v1.js 
2. Initializes a global ba function (called the ba() command queue) that allows you to schedule 
   commands to be run once the bite.js library is loaded and ready to go.
3. Adds a command to the ba() command queue to create a new tracker object for the property specified
   via the 'BA_PROGRAM_ID' parameter.
   
# Event Measurement
 
This guide explains how to measure events with bite.js
 
## Overview

Events are user interactions with content that can be measured independently from a web page 
or a screen load. User registration, bids, and final prize are all examples of actions 
you might want to measure as Events.

## Refs

When using refs to support backend events `ba` needs to have a reference passed on, usually a userId. 
Multiple refs can be used using a `,` to separate them.

`ba('init', 'event', [refs]);`
   
## debug

To enable console log for debugging add the debug action before. Make sure it's added before init to capture everything.

`ba('debug');`
   
## Implementation

Event hits can be sent using the send command and specifying a hitType of event. 
The send command has the following signature for the event hit type:

`ba('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);`

| Field Name        | Value Type           | Required  | Description |
| ------------- |:-------------:| -----:| -----------------|
| eventCategory | text | *yes* | Typically the object that was interacted with (e.g. 'bids')|
| eventAction   | text | *yes* | The type of interaction (e.g. 'highest')|
| eventLabel   | text |   no | Useful for categorizing events (e.g. 'my-objectId-123' |
| eventValue   | integer |    no | A numeric value associated with the event (e.g. 500.0) |
| eventCurrency   | ISO 4217 |    no | The local currency must be specified in the ISO 4217 standard. [Read Currency Codes Reference](supported-currencies.md).  |

## Examples

The following command sends an event to Barnebys Analytics indicating that the a new winning bid was placed on the lot "elvis-123":

`ba('send', 'event', 'bids', 'winning', 'elvis-123');`

Note that as with all send commands, the fields passed in the convenience parameters may also be specified in the fieldsObject. The above command could be rewritten as:

```
ba('send', {
  hitType: 'event',
  eventCategory: 'bids',
  eventAction: 'winning',
  eventLabel: 'elvis-123'
});
```