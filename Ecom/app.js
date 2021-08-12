const cartBtn= document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const shopNow = document.querySelector(".banner-btn");

let cart = [];
let buttonsDOM=[];

class Products{
    async getProducts(){
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products  = products.map(item => {
                const {title, price} = item.fields;
                const {id} =item.sys;
                const image = item.fields.image.fields.file.url;
                return{title,price,id,image};
            })
            return products;
        }
        catch(error){
            console.log(error);
        }
    }
}
class UI{
    displayProducts(products){
        let result = '';
        products.forEach(product =>{
            result += `
            <article class = "product">
            <div class = "img-container">
                <img src=${product.image} alt = "product" class ="product-img">
                <button class = "bag-btn" data-id=${product.id}>
                    <i class = "fas fa-shopping-cart"></i>
                    add to cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>
            `
        })
        productsDOM.innerHTML = result;
    }


    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button=>{
            let id = button.dataset.id;
            let inCart = cart.find(item=>item.id===id);
            if(inCart){
                console.log("in cart");
                button.innerText = "In Cart";
                button.disabled = true;
            }
            else{
                button.addEventListener('click',event=>{

                    event.target.innerText ="In Cart";
                    event.target.disabled =true;

                    let cartItem = {...Storage.getProduct(id),amount:1};

                    cart = [...cart,cartItem];
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    this.addCartItem(cartItem);
                    this.showCart();
                });
            }
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let items = 0;
        cart.map(item=>{
            tempTotal+= item.price*item.amount;
            items+= item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = items;
    }
    addCartItem(item){

        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt = "product">
                <div>
                    <h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    <span class ="remove-item>" data-id=${item.id}>Remove</span>
                </div>
                <div>
                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                    <p class="item-amount">${item.amount}</p>
                    <i class = "fas fa-chevron-down" data-id=${item.id}></i>
                </div>`;
        cartContent.appendChild(div);
        console.log(cartContent);
    }
    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    closeCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.closeCart);
        shopNow.addEventListener('click',this.scroll);
    }
    populateCart(cart){
        cart.forEach(item=>this.addCartItem(item));
    }
    cartLogic(){
        clearCartBtn.addEventListener('click',()=>this.clearCart());
        cartContent.addEventListener('click',event=>{
            if(event.target.classList.contains('remove-item')){
                let remove = event.target;
                cartContent.removeChild(remove.parentElement.parentElement);
                this.removeCartItem(remove.dataset.id);
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                let remove = event.target;
                let tempItem = cart.find(item=>item.id===remove.dataset.id);
                tempItem.amount = tempItem.amount +1
                Storage.saveCart(cart);
                this.setCartValues(cart);
                remove.nextElementSibiling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-chevron-down")){
                let remove= event.target;
                let tempItem = cart.find(item=> item.id===remove.dataset.id);
                if(tempItem.amount===1) {
                    cartContent.removeChild(remove.parentElement.parentElement);
                    this.removeCartItem(remove.dataset.id);

                }
                else{
                    tempItem.amount--;

                }
                Storage.saveCart(cart);
                this.setCartValues(cart);
                remove.nextElementSibiling.innerText = tempItem.amount;
            }
        });
    }
    clearCart(){
        let cartItems = cart.map(item=>item.id);
        cartItems.forEach(id=>this.removeCartItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeCartItem(id){
        cart = cart.filter(item=> item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getButton(id);
        button.disabled = false;
        button.innerHTML = `<i class = "fas fa-shopping-cart">add to cart</i>`
    }
    getButton(id){
        return buttonsDOM.find(button=>button.dataset.id===id);
    }
    scroll(){
        document.querySelector(".products").scrollIntoView(true);
    }
}
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id===id);
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}


document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();
    ui.setupApp();
    products.getProducts().then(products=>{
    ui.displayProducts(products);
    Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
})
