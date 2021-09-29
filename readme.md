# Octopus Table

### Created with [Table.js](https://github.com/JDMCreator/Table.js)

Simple system to controll table in html

• Create table
```js
const table = new OctopusTable()
const place = document.create('table')
table.fromJson(
	[
		[{content: "Name", colSpan: 2}],
		[{content: "John"}, {content: "•"}],
		[{content: "Bob"}, {content: "•"}]
	]
	)
table.mount(document.querySelector('#app'), newTable)
```
