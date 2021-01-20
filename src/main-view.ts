import {LitElement, html, css, customElement, property, internalProperty} from 'lit-element';
import '@vaadin/vaadin-tabs';
import _ from "lodash";
import 'regenerator-runtime/runtime';
import { create, cssomSheet, setup, strict } from 'twind';

setup({
  mode: strict, // Throw errors for invalid rules instead of logging
})

// 1. Create separate CSSStyleSheet
const sheet = cssomSheet({ target: new CSSStyleSheet() })

// 2. Use that to create an own twind instance
const { tw } = create({ sheet })

type ProductId = string;
type Product = Accessories | Shirts | Jackets;

interface ProductBase {
  type:string,
  id:ProductId;
  name:string,
  price:number,
  manufacturer: string
  datapayload:string
}

interface Accessories extends ProductBase {
  type: "accessories"
}

interface Shirts extends ProductBase {
  type: "shirts"
}

interface Jackets extends ProductBase {
  type: "jackets"
}

interface HasResponse {
  code: string,
  response: Availibility[]

}

interface Availibility {
    id:ProductId,
    DATAPAYLOAD:string
}



// This decorator defines the element.
@customElement('main-view')
export class MainView extends LitElement {

  @property({ type: Number})
  selectedTab = 0;

  @internalProperty()
  private currentPage = 1;

  @internalProperty()
  private itemsPerPage = 10;

  private rootUrl = "https://bad-api-assignment.reaktor.com";

  private tabs = ["accessories","jackets","shirts"];
  private products: Product[] = [];
  private data: Product[] = [];
  private availibility:Availibility[] = [];

  static styles = [sheet.target]
//https://tailwindcomponents.com/components/Tables
  render() {
    return html`
    <vaadin-tabs @selected-changed="${this.selectionChanged}">
      ${this.tabs.map((tab) => html`<vaadin-tab>${tab}</vaadin-tab>`)}
    </vaadin-tabs>
    <table class="${tw`min-w-full leading-normal`}">
    <thead>
      <tr>
        <th class="${tw`px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}">Product type</th>
        <th class="${tw`px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}">Product name</th>
        <th class="${tw`px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}">Product Price</th>
        <th class="${tw`px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}">Product availibility</th>
      </tr>
      </thead>
      ${this.products.map((product) => html`
      <tr>
        <td class="${tw`px-5 py-5 border-b border-gray-200 bg-white text-sm `}">${product.type}</td>
        <td class="${tw`px-5 py-5 border-b border-gray-200 bg-white text-sm `}">${product.name}</td>
        <td class="${tw`px-5 py-5 border-b border-gray-200 bg-white text-sm `}">${product.price}</td>
        <td class="${tw`px-5 py-5 border-b border-gray-200 bg-white text-sm `}">${this.getAvailibility(product)}</td>
      </tr>`)}
      </table>
       <div class="${tw`px-5 py-5 bg-white border-t flex flex-col items-center`}">
       <span class="${tw`text-xs text-gray-900`}">
            Showing page ${this.currentPage}
        </span>
      <div class="${tw`inline-flex mt-2`}">
          <button
              class="${tw`text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l`}"
              @click="${this.previousPage}" ?disabled="${this.disablePrevious()}"
              >
              Prev
          </button>
          <button
              class="${tw`text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r`}"
              @click="${this.nextPage}" ?disabled="${this.disableNext()}">
              Next
          </button>
          </div>
      </div>`;
  }

  async selectionChanged(event: CustomEvent) {
    this.selectedTab = event.detail.value;
    // update the list of products
    //reset the page number
    this.currentPage = 1;
    this.updateProductList();
  }

  private updateProductList() {
    this.products = this.getPaginatedItems(_.filter(this.data , product =>  product.type === this.tabs[this.selectedTab]),this.currentPage, this.itemsPerPage).data;
  }

  private nextPage() {
    if (!this.disableNext()) {
      this.currentPage++;
      this.updateProductList();
    }
  }

  private disableNext() {
    return false;
  }


  private previousPage() {
    if (!this.disablePrevious()) {
      this.currentPage--;
      this.updateProductList();
    }
  }

  private getPaginatedItems(items: Product[], page: number, pageSize: number) {
    var pg = page || 1,
      pgSize = pageSize || 100,
      offset = (pg - 1) * pgSize,
      pagedItems = _.drop(items, offset).slice(0, pgSize);
    return {
      page: pg,
      pageSize: pgSize,
      total: items.length,
      total_pages: Math.ceil(items.length / pgSize),
      data: pagedItems
    };
  }
  private disablePrevious() {
    return (this.currentPage == 1);
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.loadData();
  }

  async fetchProduct(type: string): Promise<Product[]> {
    const response = await fetch(this.rootUrl + "/products/"+type);
    if (response.status !== 200) {
     throw new Error("bad api");
    }
    return await response.json();
  }

  async fetchAllData() {
    const allProducts = await Promise.all([this.fetchProduct("accessories"), this.fetchProduct("jackets"), this.fetchProduct("shirts")]);
    return [...allProducts[0], ...allProducts[1], ...allProducts[2]];
  }

  async fetchAvailibility(manufacturer: string): Promise<HasResponse> {
    const response = await fetch(this.rootUrl + "/availability/"+manufacturer);
      if (response.status !== 200) {
       throw new Error("bad api");
      }
      return await response.json();
  }

  getAvailibility(product: Product) {
    const av = this.availibility.find(av => av.id == product.id.toUpperCase());
    if (av) {
      return av.DATAPAYLOAD;
    } else {
      return "";
    }
  }

  async loadData() {
    this.data = await this.fetchAllData();
    this.updateProductList();
    this.requestUpdate();
    const manufacturers = _.uniq(this.data.map(product => product.manufacturer));

    const parser = new DOMParser();
    Promise.all(manufacturers.map(this.fetchAvailibility.bind(this))).then(
      availibilityResponse => {
      for (const i in availibilityResponse) {

        for (const j in availibilityResponse[i].response) {
          const xmlDoc = parser.parseFromString(availibilityResponse[i].response[j].DATAPAYLOAD, "text/xml");
          const node = xmlDoc.querySelector("INSTOCKVALUE");
          if (node) {
            this.availibility.push({id:availibilityResponse[i].response[j].id, DATAPAYLOAD: node!.textContent!});
          } else {
            this.availibility.push({id:availibilityResponse[i].response[j].id, DATAPAYLOAD: ""});
          }
        }
      }
      this.requestUpdate();
    }
    );

  }
}