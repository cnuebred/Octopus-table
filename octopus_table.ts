declare let Table
import "./table.js"

export class OctopusTable {
    mountElement: HTMLElement
    grid: []
    table: any
    constructor() { }
    mount: (mountElement: HTMLElement, existElement: HTMLElement) => void
    addColumn: () => void
    addRow: () => void
    addColumnBefore: () => void
    addRowBefore: () => void
    removeColumn: () => void
    removeRow: () => void
    merge: () => void
    split: () => void
    fromJson: (json: any, table: HTMLTableElement) => HTMLElement
    toJson: () => string
    private addEvents = (cell: HTMLElement) => {
        cell.addEventListener("mousedown", (e) => {
            const target = e.target as HTMLElement
            if (target.nodeName !== 'TD') return
            if (e.ctrlKey) {
                target.classList.toggle("selected");
                return
            }
            this.table.element.querySelectorAll('.selected').forEach(item => {
                if (target.isSameNode(item)) return
                item.classList.remove('selected')
            })
            target.classList.toggle("selected");
        });
    }
    private onCreateCell = (cell: HTMLElement, obj = null) => {
        cell.setAttribute("contenteditable", 'true');
        cell.innerHTML = obj ? obj.content : '&nbsp;&nbsp;&nbsp;'
        cell.style.position = "relative";
        cell.style.width = "auto";
        this.addEvents(cell)
        setSlider(cell)
        sliderListeners(cell.querySelector('.slider-h'), 'h')
        sliderListeners(cell.querySelector('.slider-v'), 'v')
    }

}

const sliderListeners = (slider: HTMLElement, rotation) => {
    let page: number, current: HTMLElement, next: HTMLElement, currentOffset: number, nextOffset: number
    const type = rotation == 'h' ? 'width' : 'height'
    slider.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as HTMLElement
        current = rotation == 'h' ? target.parentElement : target.parentElement.parentElement
        next = current.nextElementSibling as HTMLElement
        page = rotation == 'h' ? e.pageX : e.pageY
        currentOffset = current[rotation == 'h' ? 'offsetWidth' : 'offsetHeight']
        if (next) nextOffset = next[rotation == 'h' ? 'offsetWidth' : 'offsetHeight']
    })
    document.addEventListener('mousemove', (e) => {
        if (current) {
            const diff = ((rotation == 'h' ? e.pageX : e.pageY) - page) * 1.2
            current.style[type] = currentOffset + diff + 'px'
        }
    })
    document.addEventListener("mouseup", function (e) {
        current = undefined;
        next = undefined;
        page = undefined;
        nextOffset = undefined;
        currentOffset = undefined;

    });
}
type GridStruct = {
    content: string,
    style: string,
    colSpan: number,
    rowSpan: number,
    classList: string[]
}
const setSlider = (cell: HTMLElement) => {
    const sliderH = document.createElement("div");
    const sliderV = document.createElement("div");
    sliderH.className = "slider-h";
    sliderV.className = "slider-v";
    sliderH.contentEditable = 'false';
    sliderV.contentEditable = 'false';
    cell.appendChild(sliderH)
    cell.appendChild(sliderV)
}
OctopusTable.prototype.mount = function (mountElement: HTMLElement, existElement: HTMLElement = null) {
    if (existElement)
        mountElement.innerHTML = existElement.outerHTML

    const table = new Table(mountElement)
    table.element.querySelectorAll('td').forEach(item => {
        this.addEvents(item)
        sliderListeners(item.querySelector('.slider-h'), 'h')
        sliderListeners(item.querySelector('.slider-v'), 'v')

    })
    this.table = table
}
OctopusTable.prototype.addRowBefore = function () {
    const cell = this.table.element.querySelector("td.selected") || this.table.last();
    if (cell) {
        const position = this.table.position(cell);
        this.table.insertRow(position.y, this.onCreateCell);
    }
}
OctopusTable.prototype.merge = function () {
    const cells = this.table.element.querySelectorAll("td.selected")
    this.table.merge(cells, function (colspan, rowspan, kept, removed) {
        let content = kept.innerHTML;
        for (let i = 0; i < removed.length; i++) {
            content += " " + removed[i].innerHTML;
        }
        console.log(kept)
        kept.innerHTML = content;
        const remove = (item, index) => { if (index == 0) return; item.remove() }
        kept.querySelectorAll('.slider-h').forEach(remove)
        kept.querySelectorAll('.slider-v').forEach(remove)
        sliderListeners(kept.querySelector('.slider-h'), 'h')
        sliderListeners(kept.querySelector('.slider-v'), 'v')
    });
}
OctopusTable.prototype.split = function () {
    const cells = this.table.element.querySelectorAll('td.selected')
    this.table.split(cells, function (newcell) {
        this.onCreateCell(newcell);
        newcell.classList.add("selected");
    });
}
OctopusTable.prototype.addRow = function () {
    const cell = this.table.element.querySelector("td.selected") || this.table.last();
    if (cell) {
        const position = this.table.position(cell);
        this.table.insertRow(position.y + cell.rowSpan, this.onCreateCell);
    }
}
OctopusTable.prototype.removeRow = function () {
    const cell = this.table.element.querySelector(".selected");
    if (cell) {
        const position = this.table.position(cell);
        this.table.removeRow(position.y);
    }
}
OctopusTable.prototype.addColumnBefore = function () {
    const cell = this.table.element.querySelector("td.selected") || this.table.last();
    if (cell) {
        const position = this.table.position(cell);
        this.table.insertCol(position.x, this.onCreateCell);
    }
}
OctopusTable.prototype.addColumn = function () {
    const cell = this.table.element.querySelector("td.selected") || this.table.last();
    if (cell) {
        console.log(cell)
        const position = this.table.position(cell);
        this.table.insertCol(position.x + cell.colSpan, this.onCreateCell)
    }
}
OctopusTable.prototype.removeColumn = function () {
    const cell = this.table.element.querySelector("td.selected");
    if (cell) {
        const position = this.table.position(cell);
        this.table.removeCol(position.x);
    }
}
OctopusTable.prototype.fromJson = function (json: any, table: HTMLTableElement = null) {
    const grid = typeof json == 'string' ? JSON.parse(json) : json
    Array.from(grid).forEach((item: [GridStruct]) => {
        const tr = table.insertRow()
        for (let cell of item) {
            const td = tr.insertCell()
            td.textContent = cell.content;
            td.setAttribute('colSpan', cell.colSpan ? cell.colSpan.toString() : '1')
            td.setAttribute('rowSpan', cell.rowSpan ? cell.rowSpan.toString() : '1')
            td.setAttribute('style', cell.style)
            if (cell.classList)
                for (let class_ of cell.classList) td.classList.add(class_)

            this.onCreateCell(td, cell)
        }
    })
    return table
}
OctopusTable.prototype.toJson = function (): string {
    const rows = this.table.element.rows
    console.log(rows)
    const json = []
    Array.from(rows).forEach((item: HTMLTableRowElement) => {
        const row = Array.from(item.cells).map((element: HTMLTableCellElement) => {
            return {
                content: element.textContent,
                style: element.getAttribute('style'),
                colSpan: element.colSpan,
                rowSpan: element.rowSpan
            }
        })
        json.push(row)
    })
    console.log(JSON.stringify(json))
    return JSON.stringify(json)
}