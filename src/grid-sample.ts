import {LitElement, html, css, customElement, property, internalProperty} from 'lit-element';
import '@vaadin/vaadin-tabs';
import 'regenerator-runtime/runtime';
import { create, cssomSheet, setup, strict } from 'twind';

setup({
  mode: strict, // Throw errors for invalid rules instead of logging
})

// 1. Create separate CSSStyleSheet
const sheet = cssomSheet({ target: new CSSStyleSheet() })

// 2. Use that to create an own twind instance
const { tw } = create({ sheet })

// This decorator defines the element.
@customElement('grid-sample')
export class GridSample extends LitElement {

  static styles = [sheet.target]
  render() {
    return html`<div class="${tw`grid grid-cols-1 md:grid-cols-3`}">
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
    <div>6</div>
    <div>7</div>
    <div>8</div>
    <div>9</div>
  </div>`;
  }
}