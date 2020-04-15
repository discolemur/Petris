"use strict";

// TODO optimize for mobile
class HowToComponent extends Component {
    constructor(props) {
        super(props)
        this.previous = this.previous.bind(this);
        this.next = this.next.bind(this);
        this.return = props.return;
        this.helpImgs = [
            // '/petris/static/img/examples/1.png',
            // '/petris/static/img/examples/2.png',
            // '/petris/static/img/examples/3.png',
            // '/petris/static/img/examples/4.png',
            // '/petris/static/img/examples/5.png',
            '/petris/static/img/examples/6.png',
            '/petris/static/img/examples/7.png',
            '/petris/static/img/examples/8.png',
            '/petris/static/img/examples/9.png',
            '/petris/static/img/examples/10.png'
        ];
        this.setState({ helpIndex: 0 });
    }
    previous() {
        if (this.state.helpIndex <= 0) {
            this.return();
        }
        this.setState({ helpIndex: this.state.helpIndex - 1 });
    }
    next() {
        if (this.state.helpIndex >= this.helpImgs.length - 1) {
            this.return();
        }
        this.setState({ helpIndex: this.state.helpIndex + 1 });
    }
    render(props, state) {
        return h('div', { id: 'Help' },
            h('div', {style:{margin:'auto'}}, defaultButton(state.helpIndex > 0 ? 'Back' : 'Return to Menu', defaultButtonWidth(true, 2), this.previous, true)),
            h('img', { src: this.helpImgs[state.helpIndex], style: { maxWidth: '50%', border: 'solid', objectFit: 'scale-down' } }),
            h('div', {style:{margin:'auto'}}, defaultButton(state.helpIndex < this.helpImgs.length - 1 ? 'Next' : 'Let\'s Go!', defaultButtonWidth(true, 2), this.next, true))
        )
    }
}