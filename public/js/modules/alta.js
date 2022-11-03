import productController from '/js/controllers/product.js';

console.warn('🆗: Módulo PageAlta cargado.');

class PageAlta {

    static productsTableContainer;
    static productForm;
    static fields;
    static btnCreate;
    static btnUpdate;
    static btnCancel;

    static validators = {
        'id': /^[\da-f]{24}$/,
        'name': /^[\wáéíóúüÁÉÍÓÚÜ .,-]{1,30}$/,
        'price': /^\d+$/,
        'description': /^[\wáéíóúüÁÉÍÓÚÜ ¿?¡!.,:-]{1,200}$/,
    };


    static async deleteProduct(e) {
        if (!confirm('¿Estás seguro de querer eliminar el producto?')) {
            return false;
        }
        const row = e.target.closest('tr');
        const id = row.querySelector('td[data-product-property="id"]').innerHTML;
        const deletedProduct = await productController.deleteProduct(id);
        PageAlta.loadTable();
        return deletedProduct;
    }

    static getProductFromRow(row) {
        const rowCells = row.children;
        const product = {};
        for (const cell of rowCells) {
            if (cell.dataset.productProperty) {
                product[cell.dataset.productProperty] = cell.innerHTML;
            }
        }
        return product;
    }


    static emptyForm() {
        PageAlta.fields.forEach(field => field.value = '');
    }

    static async completeForm(e) {
        const row = e.target.closest('tr');
        const productToEdit = PageAlta.getProductFromRow(row);
        console.log('productToEdit:', productToEdit);

        PageAlta.fields.forEach(field => {
            field.value = productToEdit[field.name];
        });

    }

    static async addTableEvents() {
        PageAlta.productsTableContainer.addEventListener('click', async e => {
            if (e.target.classList.contains('btn-delete')) {
                const deletedProduct = await PageAlta.deleteProduct(e);
                console.log('deletedProduct:', deletedProduct);
                if (PageAlta.objectIsEmpty(deletedProduct)) {
                    console.error('No se pudo eliminar el producto');
                }

                return;
            }
            if (e.target.classList.contains('btn-edit')) {
                PageAlta.prepareFormForEditing();
                PageAlta.completeForm(e);
                return;
            }
        });
    }

    static async renderTemplateTable(products) {
        const hbsFile = await fetch('templates/products-table.hbs').then(r => r.text());
        const template = Handlebars.compile(hbsFile);
        const html = template({ products });
        PageAlta.productsTableContainer.innerHTML = html;
    }

    static async loadTable() {
        const products = await productController.getProducts();
        console.log(`Se encontraron ${products.length} productos.`);
        PageAlta.renderTemplateTable(products);
    }

    static async prepareTable() {
        PageAlta.productsTableContainer = document.querySelector('.products-table-container');
        await PageAlta.loadTable();
        PageAlta.addTableEvents();
    }


    static prepareFormForEditing() {
        PageAlta.productForm.querySelector('[name]:not([name="id"])').focus();
        PageAlta.btnCreate.disabled = true;
        PageAlta.btnUpdate.disabled = false;
        PageAlta.btnCancel.disabled = false;
    }

    static prepareFormForCreating() {
        PageAlta.btnCreate.disabled = false;
        PageAlta.btnUpdate.disabled = true;
        PageAlta.btnCancel.disabled = true;
    }

    static validate(value, validator) {
        return validator.test(value);
    }

    static validateForm(validators) {
        let allValidated = true;
        const productToSave = {};
        console.log('\n\n');

        for (const field of PageAlta.fields) {
            if (!validators[field.name]) {
                continue;
            }
            const validated = PageAlta.validate(field.value, validators[field.name]);
            console.warn(field.name);
            console.log(`value: ${field.value}\nvalidator: ${validators[field.name]}\nvalidated: ${validated}`);
            if (!validated) {
                field.focus();
                allValidated = false;
                break;
            } else {
                productToSave[field.name] = field.value;
            }
        }
        console.log('allValidated:', allValidated);
        if (!allValidated) {
            return false;
        }
        return productToSave;
    }

    static async saveProduct(product) {
        const savedProduct = await productController.saveProduct(product);
        return savedProduct;
    }

    static async updateProduct(product) {
        const updatedProduct = await productController.updateProduct(product.id, product);
        return updatedProduct;
    }

    static async addFormEvents() {
        
        PageAlta.btnCreate.addEventListener('click', async e => {
            console.error('btn-create');
            const validators = {...PageAlta.validators};
            delete validators.id;
            // console.log(validators);
            // console.log(PageAlta.validators);
            const productToSave = PageAlta.validateForm(validators);
            console.log('productToSave:', productToSave);
            if (productToSave) {
                const savedProduct = await PageAlta.saveProduct(productToSave);
                console.log('savedProduct:', savedProduct);
                if (PageAlta.objectIsEmpty(savedProduct)) {
                    console.error('No se pudo crear el producto');
                    return;
                }
                const products = await productController.getProducts();
                console.log(`Ahora hay ${products.length} productos`);    
                PageAlta.renderTemplateTable(products);
        
                PageAlta.emptyForm();
            }
        });

        PageAlta.btnUpdate.addEventListener('click', async e => {
            console.error('btn-update');
            const productToSave = PageAlta.validateForm(PageAlta.validators);
            if (productToSave) {
                const updatedProduct = await PageAlta.updateProduct(productToSave);
                console.log('updatedProduct:', updatedProduct);
                if (PageAlta.objectIsEmpty(updatedProduct)) {
                    console.error('No se pudo guardar el producto');
                    return;
                }
                const products = await productController.getProducts();
                console.log(`Ahora hay ${products.length} productos`);    
                PageAlta.renderTemplateTable(products);        
                PageAlta.emptyForm();
                PageAlta.prepareFormForCreating();
            }
        });
        
        PageAlta.btnCancel.addEventListener('click', e => {
            console.error('btn-cancel');

            PageAlta.emptyForm();
            PageAlta.prepareFormForCreating();
        });

    }

    static objectIsEmpty(object) {
        return Object.entries(object).length === 0;
    }

    static prepareForm() {
        PageAlta.productForm = document.querySelector('.form-product');
        PageAlta.fields = PageAlta.productForm.querySelectorAll('[name]');
        PageAlta.btnCreate = PageAlta.productForm.querySelector('.form-product__btn-create');
        PageAlta.btnUpdate = PageAlta.productForm.querySelector('.form-product__btn-update');
        PageAlta.btnCancel = PageAlta.productForm.querySelector('.form-product__btn-cancel');
        PageAlta.addFormEvents();
    }




    static async init () {
        console.log('PageAlta.init()');

        PageAlta.prepareTable();
        PageAlta.prepareForm();
    }
}

export default PageAlta;
