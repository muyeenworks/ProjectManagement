import { ShowToastEvent } from "lightning/platformShowToastEvent";

function showNotification(component,titleText,messageText,variant) {
    const evt = new ShowToastEvent({
      title: titleText,
      message: messageText,
      variant: variant,
    });
    component.dispatchEvent(evt);
  }

  export { showNotification };