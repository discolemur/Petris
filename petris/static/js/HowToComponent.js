"use strict";

class WrapperComponent extends Component {
    constructor(props) {
        super(props)
        this.return = props.return;
    }
    render(props, state) {
        this.return();
        return h('div',{})
    }
}