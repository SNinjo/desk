chrome.runtime.onMessage.addListener((request) => {
    switch (request.task){
        case 'click icon':
            Container.reverseOpenState();
            break;
        
        case 'update keep':
            Keep.read();
            break;
    }
});




class Container {
    static isDisplayed = true;

    static initialize(){
        Container.create();
        Container.bind();
    }
    static create(){
        let container = document.createElement('div');
        container.setAttribute('id', 'desk');
        container.innerHTML = `
            <div></div>
        `;
        document.body.prepend(container);
    }
    static bind(){
        window.addEventListener('keydown', (event) => {
            if ((event.code === 'KeyE') && event.ctrlKey){
                event.preventDefault();
                chrome.runtime.sendMessage({
                    task: 'open website',
                    link: 'https://www.google.com',
                    code: '',
                });
            }

            if ((event.code === 'Space') && event.ctrlKey) Container.reverseOpenState();
        });
    }

    static get(){
        return document.querySelector('#desk > div');
    }
    static reverseOpenState(){
        Container.isDisplayed = !Container.isDisplayed;
        Container.get().style.display = (Container.isDisplayed)? '' : 'none';
    }
}


class Unit {
    static fetchConfig(){
        let link = chrome.extension.getURL('/unit/index.json');
        return fetch(link)
            .then(response => response.json())
    }
    static async initialize(){
        (await Unit.fetchConfig()).forEach(unitConfig => new Unit(unitConfig))
    }


    constructor(config){
        let dom = this.create(config)
        this.bind(dom, config);
    }

    create(config){
        let unit = document.createElement('div');
        unit.classList.add('unit');
        unit.innerHTML = `
            <img
                title='${config.name} (${this.toString(config.key)})'
                alt='${this.toString(config.key)}'
                src='${chrome.extension.getURL(`/unit/icons/${config.icon}`)}'
            />
            <span>${config.name}</span>
        `;
        Container.get().append(unit);
        return unit;
    }
    bind(dom, config){
        const sendTask = async () => {
            let keep = Keep.get().value;
            let link = config.link;
            let code = await this.getCode(config.code);
            if (keep && (keep !== '') && (config.linkUsingKeep !== '')){
                link = config.linkUsingKeep.replace(/<keep>/g, keep);
                code = (await this.getCode(config.codeUsingKeep)).replace(/<keep>/g, keep);
            }

            chrome.runtime.sendMessage({
                task: 'open website',
                link: link,
                code: code,
            });
        }

        dom.addEventListener('click', sendTask);
        window.addEventListener('keydown', (event) => {
            if (config.key.code !== event.code) return;
            if (config.key.alt && !event.altKey) return;
            if (config.key.ctrl && !event.ctrlKey) return;
            if (config.key.shift && !event.shiftKey) return;

            event.preventDefault();
            sendTask();
        });
    }

    toString(key){
        return `${(key.ctrl)? `ctrl + ` : ''}${(key.shirt)? `shirt + ` : ''}${(key.alt)? `alt + ` : ''}${key.code}`
    }
    async getCode(link){
        if (link === '') return '';
        
        return fetch( chrome.extension.getURL(`/unit/codes/${link}`) )
            .then(response => response.text())
    }
}


class Keep {
    static initialize(){
        Keep.create();
        Keep.bind();
        Keep.read();
    }
    static create(){
        let keep = document.createElement('div');
        keep.setAttribute('id', 'keep');
        keep.innerHTML = `
            <input type='text' placeholder='<keep>' />
            <button>copy</button>
        `;
        Container.get().prepend(keep);
    }
    static bind(){
        const copy = () => navigator.clipboard.writeText(Keep.get().value);
        const paste = () => {
            navigator.clipboard.readText()
                .then(text => Keep.set(text))
        }
        const button = document.querySelector('#desk #keep button');
        const playCopyAnimation = () => {
            button.style.color = '#6aff65';
            setTimeout(() => button.style.color = '', 2000);
        }

        button.addEventListener('click', () => {
            copy();
            playCopyAnimation();
        });
        window.addEventListener('keydown', (event) => {
            if ((event.code === 'KeyC') && event.altKey){
                copy();
                playCopyAnimation();
            }
            if ((event.code === 'KeyV') && event.altKey)
                paste();
        });


        document.querySelector('#desk #keep input').addEventListener('change', () => {
            Keep.store();
            chrome.runtime.sendMessage({
                task: 'update keep',
            });
        });
        window.addEventListener('keydown', (event) => {
            if ((event.code === 'KeyG') && event.altKey) Keep.set('');
        })
    }

    static get(){
        return document.querySelector('#desk #keep input');
    }
    static set(text){
        Keep.get().value = text;
        Keep.store();
        chrome.runtime.sendMessage({
            task: 'update keep',
        });
    }
    static read(){
        chrome.storage.local.get("keep", (result) => {
            Keep.get().value = result.keep;
        });
    }
    static store(){
        chrome.storage.local.set({ "keep": Keep.get().value });
    }
}




function main(){
    Container.initialize();
    Keep.initialize();
    Unit.initialize();
}
main();