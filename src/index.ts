import _ from "lodash"

type ProductId = string;
type Product = Accessories | Shirts | Jackets;

interface ProductBase {
  type:string,
  id:ProductId;
  name:string,
  price:number,
  manufacturer: string
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
  response: Availibility

}

interface Availibility {
    id:ProductId,
    DATAPAYLOAD:string
}

const rootUrl = "https://bad-api-assignment.reaktor.com"

  async function fetchProduct(type: string): Promise<Product[]> {
    const response = await fetch(rootUrl + "/products/"+type);
    if (response.status !== 200) {
     throw new Error("bad api");
    }
    return await response.json();
  }

  async function fetchAllData() {
    const allProducts = await Promise.all([fetchProduct("accessories"), fetchProduct("jackets"), fetchProduct("shirts")]);
    return [...allProducts[0], ...allProducts[1], ...allProducts[2]];
  }

  async function fetchAvailibility(manufacturer: string): Promise<HasResponse> {
    const response = await fetch(rootUrl + "/availability/"+manufacturer);
      if (response.status !== 200) {
       throw new Error("bad api");
      }
      return await response.json();
  }

  async function main() {
    const data = await fetchAllData();
    const table = document.createElement("table");
    const header =table.createTHead();
    const rowH = header.insertRow(0);
    const cellH0 = rowH.insertCell(0);
    const cellH1 = rowH.insertCell(1);
    const cellH2 = rowH.insertCell(2);
    const cellH3 = rowH.insertCell(3);
    cellH0.textContent = "Product type";
    cellH1.textContent = "Product name";
    cellH2.textContent = "Product Price";
    cellH3.textContent = "Product availibility";
    const manufacturers = _.uniq(data.map(product => product.manufacturer));
    console.log(manufacturers.length);
    let availibility:Availibility[] = [];
    let availibilityResponse = await Promise.all(manufacturers.map(fetchAvailibility));
    for (const i in availibilityResponse) {
        //let availibilityResponse = await fetchAvailibility(manufacturers[i]);
        availibility = availibility.concat(availibilityResponse[i].response);
        debugger;
    }

    data.forEach( (product, i) => {
        const row = table.insertRow(i + 1);
          const cell0 = row.insertCell(0);
        cell0.textContent = product.type;
          const cell1 = row.insertCell(1);
        cell1.textContent = product.name;
        const cell2 = row.insertCell(2);
        cell2.textContent = product.price.toString();

        const cell3 = row.insertCell(3);
        const av = availibility.find(av => av.id == product.id.toUpperCase());
        if (av) {
          cell3.innerHTML = av.DATAPAYLOAD;
        }
    });
    document.body.appendChild(table);
  }

  main();