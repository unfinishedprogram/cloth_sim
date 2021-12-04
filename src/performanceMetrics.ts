

class Metric{
	elm:HTMLElement;
	name:string
	valElm:HTMLElement;
	constructor(name:string){
		this.name = name;
		this.elm = document.createElement("tr");
		let label = document.createElement("td");
		label.innerText = `${name}: `;
		this.valElm = document.createElement("td");
		this.elm.classList.add(name);
		this.elm.classList.add("metric");
		this.elm.appendChild(label);
		this.elm.appendChild(this.valElm);
	}

	update(newVal:number){
		this.valElm.innerText = `${newVal}`;
	}
}

export default class PerformanceMetrics {
	metrics:{[i:string]:Metric};
	elm:HTMLElement;
	constructor(){
		this.metrics = {};
		this.elm = document.createElement("table");
		this.elm.id = "performance_metrics";
	}

	addMetric(name:string){
		this.metrics[name] = new Metric(name);
		this.elm.appendChild(this.metrics[name].elm);
	}

	setMetric(metric:string, value:number){
		if(!this.metrics[metric]) this.addMetric(metric);
		this.metrics[metric].update(Math.round(value * 1000)/1000);
	}
}