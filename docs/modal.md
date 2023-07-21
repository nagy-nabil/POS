# How i see Modals?

## use cases

- take data from user for insert or update

- take user confirmation before doing something that cannot be reversed, like deleting order for example deleting order

## General guideline for modal operation

- if you're using it to take user input
  - with success: reset the form and close the modal

  - with cancel: close the modal without resetting the form

  - with error: show the error above the submit button

- if you're using the modal for confirmation

  - with confirm: close the modal and perform the action, and show the loading on the button used to open the modal

  - with cancel: close the modal without performing the action

  - with error: show the error above the button used to open the modal because OFC it would be already closed
