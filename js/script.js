"use strict"

// VARIABLES -----------------------
var riskChart = document.getElementById("riskChart").getContext("2d")

const colors = [
	"rgba(255, 102, 255)",
	"rgba(255, 0, 0)",
	"rgba(255, 169, 0)",
	"rgba(255, 255, 0)",
	"rgba(144, 238, 144)",
]

const backgrounds = [
	"rgba(255, 102, 255, 0.5)",
	"rgba(255, 0, 0, 0.5)",
	"rgba(255, 169, 0, 0.5)",
	"rgba(255, 255, 0, 0.5)",
	"rgba(144, 238, 144, 0.5)",
]

const threats = [
	"Easy of Discovery",
	"Ease of Exploit",
	"Awareness",
	"Intrusion Detection",
	"Loss of confidentiality",
	"Loss of Integrity",
	"Loss of Availability",
	"Loss of Accountability",
]

const partials = ["ed", "ee", "a", "id", "lc", "li", "lav", "lac"]

const riskChartOptions = {
	legend: {
		position: "top",
		display: false,
	},
	title: {
		display: false,
		text: "Chart.js Radar Chart",
	},
	scale: {
		ticks: {
			beginAtZero: true,
			suggestedMin: 0,
			suggestedMax: 10,
			stepSize: 1,
		},
	},
}

// CHARTS -----------------------
riskChart = new Chart(riskChart, {
	type: "radar",
	data: {
		labels: [],
		datasets: [
			{
				data: [],
				pointBackgroundColor: "",
				backgroundColor: "",
				borderColor: "",
				borderWidth: 2,
			},
		],
	},
	options: riskChartOptions,
})

updateRiskChart()

if (getUrlParameter("vector")) {
	loadVectors(getUrlParameter("vector"))
}

// FUNCTIONS -----------------------
function loadVectors(vector) {
	vector = vector.replace("(", "").replace(")", "")
	var values = vector.split("/")

	if (values.length == 8) {
		for (let i = 0; i < values.length; i++) {
			let aux = values[i].split(":")
			let vector = aux[1]
			console.log(vector)
			$("#" + partials[i].toLowerCase()).val(vector)
		}
	} else {
		swal(
			"Hey!!",
			"The vector is not correct, make sure you have copied correctly",
			"error"
		)
	}

	calculate()
}

function calculate() {
	var LS = 0
	var IS = 0
	var dataset = []
	var score = ""
	deleteClass()

	// Get values THREAT AGENT FACTORS and VULNERABILITY FACTORS
	LS = +$("#ed").val() + +$("#ee").val() + +$("#a").val() + +$("#id").val() + 0
	dataset.push($("#ed").val())
	dataset.push($("#ee").val())
	dataset.push($("#a").val())
	dataset.push($("#id").val())

	// Get values TECHNICAL IMPACT FACTORS and BUSINESS IMPACT FACTORS
	IS =
		+$("#lc").val() + +$("#li").val() + +$("#lav").val() + +$("#lac").val() + 0
	dataset.push($("#lc").val())
	dataset.push($("#li").val())
	dataset.push($("#lav").val())
	dataset.push($("#lac").val())

	var LS = (LS / 4).toFixed(3)
	var IS = (IS / 4).toFixed(3)

	var FLS = getRisk(LS)
	var FIS = getRisk(IS)

	$(".LS").text(LS + " " + FLS)
	$(".IS").text(IS + " " + FIS)

	score = "("
	score = score + "ED:" + $("#ed").val() + "/"
	score = score + "EE:" + $("#ee").val() + "/"
	score = score + "A:" + $("#a").val() + "/"
	score = score + "ID:" + $("#id").val() + "/"
	score = score + "LC:" + $("#lc").val() + "/"
	score = score + "LI:" + $("#li").val() + "/"
	score = score + "LAV:" + $("#lav").val() + "/"
	score = score + "LAC:" + $("#lac").val()
	score = score + ")"
	$("#score").text(score)
	$("#score").attr(
		"href",
		"https://javierolmedo.github.io/OWASP-Calculator/?vector=" + score
	)

	if (getRisk(LS) == "Low") {
		$(".LS").addClass("classNote")
	} else if (getRisk(LS) == "Moderate") {
		$(".LS").addClass("classMedium")
	} else {
		$(".LS").addClass("classHigh")
	}

	if (getRisk(IS) == "Low") {
		$(".IS").addClass("classNote")
	} else if (getRisk(IS) == "Moderate") {
		$(".IS").addClass("classMedium")
	} else {
		$(".IS").addClass("classHigh")
	}

	//FINAL
	var RS = getCriticaly(FLS, FIS)
	if (RS == "NOTE") {
		$(".RS").text(RS)
		$(".RS").addClass("classNote")
	} else if (RS == "Low") {
		$(".RS").text(RS)
		$(".RS").addClass("classLow")
	} else if (RS == "Moderate") {
		$(".RS").text(RS)
		$(".RS").addClass("classMedium")
	} else if (RS == "Significant") {
		$(".RS").text(RS)
		$(".RS").addClass("classHigh")
	} else if (RS == "Severe") {
		$(".RS").text(RS)
		$(".RS").addClass("classCritical")
	} else {
		$(".RS").text(RS)
		$(".RS").addClass("classNote")
	}

	updateRiskChart(dataset, RS)
}

function getRisk(score) {
	if (score == 0) return "NOTE"
	if (score < 3) return "Low"
	if (score < 6) return "Moderate"
	if (score <= 9) return "Significant"
}

// Calculate final Risk Serverity
function getCriticaly(L, I) {
	//NOTE
	if (L == "Low" && I == "Low") return "NOTE"

	//Low
	if (L == "Low" && I == "Moderate") return "Low"
	if (L == "Moderate" && I == "Low") return "Low"

	//Moderate
	if (L == "Low" && I == "Significant") return "Moderate"
	if (L == "Moderate" && I == "Moderate") return "Moderate"
	if (L == "Significant" && I == "Low") return "Moderate"

	//Significant
	if (L == "Significant" && I == "Moderate") return "Significant"
	if (L == "Moderate" && I == "Significant") return "Significant"

	//Severe
	if (L == "Significant" && I == "Significant") return "Severe"
}

// Delete class before of calculate
function deleteClass() {
	// Delete Class Likelihood Score
	$(".LS").removeClass("classNote")
	$(".LS").removeClass("classMedium")
	$(".LS").removeClass("classHigh")

	// Delete Class Impact Score
	$(".IS").removeClass("classNote")
	$(".IS").removeClass("classMedium")
	$(".IS").removeClass("classHigh")

	// Delete Class Risk Severity
	$(".RS").removeClass("classNote")
	$(".RS").removeClass("classLow")
	$(".RS").removeClass("classMedium")
	$(".RS").removeClass("classHigh")
	$(".RS").removeClass("classCritical")
}

function getUrlParameter(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
	var results = regex.exec(location.search)
	return results === null
		? ""
		: decodeURIComponent(results[1].replace(/\+/g, " "))
}

function updateRiskChart(dataset, RS) {
	var c = 0
	var dataset = dataset

	switch (RS) {
		case "Low":
			c = 3
			break
		case "Moderate":
			c = 2
			break
		case "Significant":
			c = 1
			break
		case "Severe":
			c = 0
			break
		default:
			c = 4
			break
	}

	riskChart.data.labels = threats
	riskChart.data.datasets[0].data = dataset
	riskChart.data.datasets[0].pointBackgroundColor = colors[c]
	riskChart.data.datasets[0].backgroundColor = backgrounds[c]
	riskChart.data.datasets[0].borderColor = colors[c]

	riskChart.update()
}
