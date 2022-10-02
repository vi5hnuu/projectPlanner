
const PROJECT_TYPE = {
    ACTIVE: 'card--activeProjects',
    FINISHED: 'card--finishedProjects',
    PENDING: 'card--pendingProjects',
}
///////////////////////////////////////
const defaultProjects = [
    {
        name: 'Hotel Management',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis veniam nemo praesentium eos at quis facere, voluptate adipisci neque accusantium, quos maiores aut odit modi vel dicta odio, molestiae nam!`,
        type: PROJECT_TYPE.ACTIVE
    },
    {
        name: 'Automation',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis veniam nemo praesentium eos at quis facere, voluptate adipisci neque accusantium, quos maiores aut odit modi vel dicta odio, molestiae nam!`,
        type: PROJECT_TYPE.ACTIVE
    },

    {
        name: 'App Development',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis veniam nemo praesentium eos at quis facere, voluptate adipisci neque accusantium, quos maiores aut odit modi vel dicta odio, molestiae nam!`,
        type: PROJECT_TYPE.PENDING
    },
    {
        name: 'Resort',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis veniam nemo praesentium eos at quis facere, voluptate adipisci neque accusantium, quos maiores aut odit modi vel dicta odio, molestiae nam!`,
        type: PROJECT_TYPE.PENDING
    },
    {
        name: 'Hotel Booking',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis veniam nemo praesentium eos at quis facere, voluptate adipisci neque accusantium, quos maiores aut odit modi vel dicta odio, molestiae nam!`,
        type: PROJECT_TYPE.FINISHED
    }, {
        name: 'Time management',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perferendis veniam nemo praesentium eos at quis facere, voluptate adipisci neque accusantium, quos maiores aut odit modi vel dicta odio, molestiae nam!`,
        type: PROJECT_TYPE.ACTIVE
    }
]
///////////////////////////////////////

class Project {
    static id = -1
    #emptyProjectHtml() {
        return '<div class="empty">No Projects to show.</div>'
    }
    #ProjectHtmlEl(pName, pDiscription, type) {
        const btnF = '<Button class="btn btn--finish">Finish</Button>'
        const btnP = '<Button class="btn btn--activate">Activate</Button>'
        const additionalButton = type == PROJECT_TYPE.ACTIVE ? btnF : type == PROJECT_TYPE.PENDING ? btnP : ''
        const innerHtmll = `
        <h3>${pName}</h3>
        <p>${pDiscription}</p>
        <div class="actions">
            <Button class="btn btn--moreInfo">MoreInfo</Button>
            ${additionalButton}
        </div>
        `
        const pEl = document.createElement('div')
        pEl.draggable = PROJECT_TYPE.FINISHED == type ? false : true//finished project are not draggable
        pEl.className = 'project'
        pEl.dataset.id = this.pId
        pEl.insertAdjacentHTML('beforeEnd', innerHtmll)
        this.#addBtnListenersOn(pEl)
        this.#connectDrag(pEl)
        return pEl
    }
    #connectDrag(pEl) {
        // console.log(this);
        pEl.addEventListener('dragstart', function (evnt) {
            // console.log(this);//project
            evnt.dataTransfer.setData('text/plain', this.dataset.id)
            evnt.dataTransfer.effectAllowed = 'move'
        })
    }
    #addBtnListenersOn(projectEl) {
        const btnActivate = projectEl.querySelector('.btn--activate')
        const btnFinish = projectEl.querySelector('.btn--finish')
        const btnMoreInfo = projectEl.querySelector('.btn--moreInfo')

        if (btnActivate) {
            btnActivate.addEventListener('click', () => {
                this.changeProjectStatus(PROJECT_TYPE.ACTIVE)
            })
        } else if (btnFinish) {
            btnFinish.addEventListener('click', () => {
                this.changeProjectStatus(PROJECT_TYPE.FINISHED)
            })
        }
        ///
        if (btnMoreInfo) {
            btnMoreInfo.addEventListener('click', () => {
                console.log('more-info');
            })
        }
    }
    constructor(pName, pDiscription, type = PROJECT_TYPE.PENDING) {
        Project.id = Project.id + 1
        this.pId = Project.id
        this.projectName = pName
        this.projectDiscription = pDiscription
        this.projectType = type
    }

    #getProjectEl() {
        return this.#ProjectHtmlEl(this.projectName, this.projectDiscription, this.projectType)
    }
    renderProject() {
        const pListContainer = document.querySelector(`.${this.projectType}  .projects`)
        if (pListContainer.firstElementChild.className == 'empty') {
            pListContainer.innerHTML = ''
        }
        const projectEl = this.#getProjectEl()
        pListContainer.appendChild(projectEl)
        //scroll to vire
        projectEl.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    changeProjectStatus(type) {
        if (this.projectType == type)
            return;

        const pListContainer = document.querySelector(`.${this.projectType}  .projects`)
        // remove project from prev category
        const oldChild = pListContainer.querySelector(`[data-id="${this.pId}"]`)
        console.log(oldChild);
        pListContainer.removeChild(oldChild)
        //check if this was only child in that container
        if (pListContainer.childElementCount == 0) {
            pListContainer.insertAdjacentHTML('beforeEnd', this.#emptyProjectHtml())
        }
        //re-render to different category
        this.projectType = type
        this.renderProject()
    }
}


// storage and advancement management
class Manager {
    constructor() {
        ////
        const addProj = document.querySelector('.btn--addProject')
        addProj.addEventListener('click', this.addProject.bind(this))
        ////
        const submitProj = document.querySelector('.btn-submit')
        submitProj.addEventListener('click', this.#submitProj.bind(this))
        ///
        const backdrop = document.querySelector('.backdrop')
        backdrop.addEventListener('click', this.#toggleAddProjectModal.bind(this));
        ///

        ////////drag
        const aProjectsContainer = document.querySelector('.card--activeProjects .projects')
        const pProjectsContainer = document.querySelector('.card--pendingProjects .projects')
        const fProjectsContainer = document.querySelector('.card--finishedProjects .projects')

        //active projects
        aProjectsContainer.addEventListener('dragenter', (evnt) => {
            evnt.preventDefault()
            aProjectsContainer.classList.add('draggable')
        })
        aProjectsContainer.addEventListener('dragover', (evnt) => {
            evnt.preventDefault()
        })
        aProjectsContainer.addEventListener('dragleave', (evnt) => {
            evnt.preventDefault()
            if (!evnt.relatedTarget.closest('.projects'))
                aProjectsContainer.classList.remove('draggable')
        })
        aProjectsContainer.addEventListener('drop', (evnt) => {
            const draggedProj = document.querySelector(`[data-id="${evnt.dataTransfer.getData('text/plain')}"]`)
            const activebtn = draggedProj.querySelector('.btn--activate')
            aProjectsContainer.classList.remove('draggable')
            if (activebtn)//means active project is dragged here...else pending project is dragged
                activebtn.click()
        })


        //finished projects
        fProjectsContainer.addEventListener('dragenter', (evnt) => {
            evnt.preventDefault()
            fProjectsContainer.classList.add('draggable')
        })
        fProjectsContainer.addEventListener('dragover', (evnt) => {
            evnt.preventDefault()
        })
        fProjectsContainer.addEventListener('dragleave', (evnt) => {
            evnt.preventDefault()
            if (!evnt.relatedTarget || !evnt.relatedTarget.closest('.projects'))
                fProjectsContainer.classList.remove('draggable')
        })
        fProjectsContainer.addEventListener('drop', (evnt) => {
            const draggedProj = document.querySelector(`[data-id="${evnt.dataTransfer.getData('text/plain')}"]`)
            const finishbtn = draggedProj.querySelector('.btn--finish')
            fProjectsContainer.classList.remove('draggable')
            if (finishbtn)//means active project is dragged here...else pending project is dragged
                finishbtn.click()
        })
        //pending project
        pProjectsContainer.addEventListener('dragenter', (evnt) => {
            evnt.preventDefault()
            pProjectsContainer.classList.add('draggable')
        })
        pProjectsContainer.addEventListener('dragover', (evnt) => {
            evnt.preventDefault()
        })
        pProjectsContainer.addEventListener('dragleave', (evnt) => {
            evnt.preventDefault()
            if (!evnt.relatedTarget.closest('.projects'))
                pProjectsContainer.classList.remove('draggable')
        })
        pProjectsContainer.addEventListener('drop', (evnt) => {
            const draggedProj = document.querySelector(`[data-id="${evnt.dataTransfer.getData('text/plain')}"]`)
            pProjectsContainer.classList.remove('draggable')
            //no drop alloweded here
        })

    }
    static init() {
        defaultProjects.forEach((project) => {
            const proj = new Project(project.name, project.description, project.type)
            proj.renderProject()
        })
    }

    #toggleModal() {
        document.querySelector('.modal').classList.toggle('hidden')
    }
    #toggleBackdrop() {
        document.querySelector('.backdrop').classList.toggle('hidden')
    }
    #getProjData() {
        const nameEl = document.getElementById('name')
        const descEl = document.getElementById('description')
        // const compleEl = document.getElementById()
        const dt = {
            pName: nameEl.value,
            pDiscription: descEl.value
        }
        return dt;
    }
    #resetFields() {
        const nameEl = document.getElementById('name')
        const descEl = document.getElementById('description')
        // const compleEl = document.getElementById()
        nameEl.value = ''
        descEl.value = ''
    }
    #toggleAddProjectModal() {
        this.#toggleBackdrop()
        this.#toggleModal()
    }
    #submitProj() {
        ///////////////////////
        const dt = this.#getProjData()
        this.#toggleAddProjectModal()
        this.#resetFields()
        ///also implement if no data is provided issue
        const proj = new Project(dt.pName, dt.pDiscription)
        proj.renderProject()
    }
    addProject() {
        this.#toggleAddProjectModal()
    }
}
Manager.init()
const manager = new Manager()


