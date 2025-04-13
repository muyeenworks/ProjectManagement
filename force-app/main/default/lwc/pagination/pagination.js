import { LightningElement,api } from 'lwc';

export default class Pagination extends LightningElement {
    @api pageValue;
    @api options = [];
    @api offset = 0;

    handlePageChange(event){
        let selectedPageNumber = event.detail.value;
        this.offset = (selectedPageNumber - 1) * 5;
        this.pageValue = parseInt(selectedPageNumber);
        this.dispatchEvent(new CustomEvent('pagechange',{detail:{value:this.offset}}));
    }
}