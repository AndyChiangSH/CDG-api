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
        $("#start-icon").show();
        $("#loading-icon").hide();
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
        let article = $("#article").val();
        if (article.trim() == "") {
            alert("Input can't be empty!");
        }
        else {
            $("#confirm").hide();
            $("#examples").hide();
            $("#reset").show();
            $("#generate").show();

            // console.log(article);
            $("#article-container").hide();
            $("#confirmed-article-container").show();
            $("#confirmed-article").val(article);
        }
    })

    $("#reset").click(function () {
        init();
    })

    function select_article(event) {
        let start = event.target.selectionStart;
        let end = event.target.selectionEnd;
        let article = event.target.value;
        let selection = article.substring(start, end);
        // console.log(article, selection, start, end);

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
        // console.log(display);
        $("#display-selections").html(display);
    }

    const confirmed_article = document.querySelector("#confirmed-article");
    confirmed_article.addEventListener("select", select_article);

    $("#generate").click(function () {
        if (selection_list.length == 0) {
            alert("Please highlight at least one word for blank!");
        }
        else {
            $("#stem").html("");
            $("#questions").html("");
            $("#answers").html("");
            $("#result").hide();
            $("#start-icon").hide();
            $("#loading-icon").show();

            const API_URL = "/api"
            $.ajax({
                url: API_URL,
                type: "POST",
                data: { stem: $("#confirmed-article").val() },
                dataType: "JSON",
                success: function (response) {
                    $("#result").slideDown(300);
                    console.log(response);
                    let stem = response["stem"];
                    let options = response["options"];

                    $("#stem").html(stem);

                    let answers_list = [];
                    let questions_text = "";
                    for (let i = 0; i < options.length; i++) {
                        questions_text += '<li class="my-3"><ol class="options">';
                        let options_len = options[i]["distractors"].length + 1;
                        let answer = options[i]["answer"];
                        let answer_index = Math.floor(Math.random() * options_len);
                        let distractors = options[i]["distractors"];
                        shuffle(distractors);
                        let distractors_index = 0;
                        for (let j = 0; j < options_len; j++) {
                            if (j == answer_index) {
                                questions_text += '<li class="answer-option">' + answer + '</li>';
                            }
                            else {
                                questions_text += '<li>' + distractors[distractors_index] + '</li>';
                                distractors_index++;
                            }
                        }
                        questions_text += '</ol></li>';

                        if (answer_index == 0) {
                            answers_list.push("A");
                        }
                        else if (answer_index == 1) {
                            answers_list.push("B");
                        }
                        else if (answer_index == 2) {
                            answers_list.push("C");
                        }
                        else {
                            answers_list.push("D");
                        }
                    }
                    $("#questions").html(questions_text);

                    let answers_text = "";
                    for (let i = 0; i < answers_list.length; i++) {
                        answers_text += '<li>' + answers_list[i] + '</li>';
                    }
                    $("#answers").html(answers_text);
                    // console.log(answers_list);
                },
                error: function (thrownError) {
                    // console.log("error msg:", thrownError);
                    alert("API ERROR!\nPlease let us know, and we will fix it as soon as possible.");
                },
                complete: function () {
                    $("#start-icon").show();
                    $("#loading-icon").hide();
                }
            });
        }
    });

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
})