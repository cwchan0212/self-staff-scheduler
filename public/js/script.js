

function submitReport(team) {
    let form = $("#reportForm");
    $("input[name='team']").remove();
    let input = $("<input>").attr("type", "hidden").attr("name", "team").val(team);
    input.appendTo("#reportForm");
    let url = "/report";
    form.attr({
        "action": url,
        "method": "post",
        "target": "_blank",
    })
    $("#reportForm").submit();
}

$(document).ready(function(){
    $(".team-button").on("click", function(e) {
        e.preventDefault();
        let team = $(this).val();
        submitReport(team);
    });
});

$(document).ready(function(){
    $("#dateField").change(function(){
        $("#dateForm").submit();
    });
});

$(document).ready(function() {
    $("#dateMinus").click(function(){
        console.log($("#dateField").val())
        updateDate(-1)
    })
})


$(document).ready(function() {
    $("#datePlus").click(function(){
        console.log($("#dateField").val())
        updateDate(1)
    })
})

function updateDate(monthChange) {
    let newDate = new Date($("#dateField").val())
    let newYear = newDate.getFullYear()
    let newMonth = newDate.getMonth() + monthChange
    if (newMonth < 0) {
        newYear -= 1
        newMonth = 11
    } else if (newMonth > 11) {
        newYear += 1
        newMonth = 0
    }
    let newDateChangeMonth = new Date(newYear, newMonth, 1)
    let month = newDateChangeMonth.getMonth() + 1
    let year = newDateChangeMonth.getFullYear()
    $("#dateField").val(year + "-" + ((month < 10) ? "0": "") + month)
    $("#dateForm").submit();
}



function staffReport(e) {
    let button = e.target;
    
    let staffId = button.getAttribute("data-staffId");
    if (staffId) {
        let form = $("#actionForm");
        $("input[name='staffId']").remove();
        let input = $("<input>").attr("type", "hidden").attr("name", "staffId").val(staffId);
        input.appendTo("#actionForm");
        let url = "/report/" + staffId;
        form.attr({
            "action": url,
            "method": "post",
            "target": "_blank",
        })
        form.submit();
    }
}

$(document).ready(function(){
    $(".staff-button").on("click", function(e) {
        e.preventDefault();
        staffReport(e);
    });
});
