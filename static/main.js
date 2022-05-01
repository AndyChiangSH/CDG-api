$(function () {
    var selection_list = [];

    function init() {
        $("#confirm").show();
        $("#examples").show();
        $("#reset").hide();
        $("#generate").hide();
        $("#result").hide();
        $("#article-container").show();
        $("#confirmed-article-container").hide();
        selection_list = [];
        $("#display-selections").html("");
    }
    init();

    example1 = "You had better learn to be grateful. If you are grateful, you naturally open yourself up to receive all kinds of blessings and good things in life. You can receive almost everything you want truly. If you want recovery soon, start by feeling grateful that you are still alive. If it is more money that you want, start being grateful for whatever amount of money you already have."
    example2 = "Google LLC is an American multinational technology company that focuses on artificial intelligence, search engine, online advertising, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics. It has been referred to as the 'most powerful company in the world' and one of the world's most valuable brands due to its market dominance, data collection, and technological advantages in the area of artificial intelligence. It is considered one of the Big Five American information technology companies, alongside Amazon, Apple, Meta, and Microsoft."

    $("#examples").change(function () {
        let value = $("#examples").val();
        if (value == "customize") {
            $("#article").val("");
        }
        else if (value == "example1") {
            $("#article").val(example1);
        }
        else if (value == "example2") {
            $("#article").val(example2);
        }
    })

    $("#confirm").click(function () {
        $("#confirm").hide();
        $("#examples").hide();
        $("#reset").show();
        $("#generate").show();

        let article = $("#article").val();
        console.log(article);
        $("#article-container").hide();
        $("#confirmed-article-container").show();
        $("#confirmed-article").val(article);
    })

    $("#reset").click(function () {
        init();
    })

    $("#generate").click(function () {
        $("#result").show();
    })

    function select_article(event) {
        let start = event.target.selectionStart;
        let end = event.target.selectionEnd;
        let article = event.target.value;
        let selection = article.substring(start, end);
        console.log(article, selection, start, end);

        new_article = article.slice(0, start) + "[" + selection + "]" + article.slice(end);
        $("#confirmed-article").val(new_article);
        selection_list.push(selection)
        display_selections();
    }

    function display_selections() {
        let display = selection_list.length.toString() + " selected:";
        for (let i = 0; i < selection_list.length; i++) {
            display += "<span class='badge bg-primary mx-1'>" + selection_list[i] + "</span>"
        }
        console.log(display);
        $("#display-selections").html(display);
    }

    const confirmed_article = document.querySelector("#confirmed-article");
    confirmed_article.addEventListener("select", select_article);
})