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
    example2 = "Twenty-one years ago, my husband gave me Sam, an eight-week-old dog, to help me ease the loss of our daughter. Later my husband and I moved from New York to New Jersey where our neighbor, whose cat had recently had kittens, asked us if we would like one. We were afraid that Sam would not be glad, but we made up our minds to take a kitten. We picked a little, gray, playful cat. She raced around running after imaginary mice and squirrels and jumped from table to chair very quickly, so we named her Lightning."

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
            copy_text = "";
            json_obj = {};

            const API_URL = "/api"
            $.ajax({
                url: API_URL,
                type: "POST",
                data: { stem: $("#confirmed-article").val() },
                dataType: "JSON",
                success: function (response) {
                    $("#result").slideDown(300);
                    console.log(response);
                    json_obj = response;
                    let stem = response["stem"];
                    let options = response["options"];

                    $("#stem").html(stem);
                    copy_text += "Stem:\n" + stem + "\n"

                    let answers_list = [];
                    let questions_text = "";
                    copy_text += "Options:\n";
                    for (let i = 0; i < options.length; i++) {
                        questions_text += '<li class="my-3"><ol class="options">';
                        copy_text += (i + 1).toString() + ".\n";
                        let options_len = options[i]["distractors"].length + 1;
                        let answer = options[i]["answer"];
                        let answer_index = Math.floor(Math.random() * options_len);
                        let distractors = options[i]["distractors"];
                        shuffle(distractors);
                        let distractors_index = 0;
                        for (let j = 0; j < options_len; j++) {
                            if (j == answer_index) {
                                questions_text += '<li class="answer-option">' + answer + '</li>';
                                copy_text += num2en(j) + ". " + answer + "\n";
                            }
                            else {
                                questions_text += '<li>' + distractors[distractors_index] + '</li>';
                                copy_text += num2en(j) + ". " + distractors[distractors_index] + "\n";
                                distractors_index++;
                            }
                        }
                        questions_text += '</ol></li>';

                        answers_list.push(num2en(answer_index));
                    }
                    $("#questions").html(questions_text);

                    let answers_text = "";
                    copy_text += "Answers:\n";
                    for (let i = 0; i < answers_list.length; i++) {
                        answers_text += '<li>' + answers_list[i] + '</li>';
                        copy_text += (i + 1).toString() + ". " + answers_list[i] + "\n";
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

    function num2en(i) {
        if (i == 0) {
            return "A";
        }
        else if (i == 1) {
            return "B";
        }
        else if (i == 2) {
            return "C";
        }
        else {
            return "D";
        }
    }

    var copy_text = "";
    var json_obj = {};

    $("#copy-to-clipboard").click(function () {
        navigator.clipboard.writeText(copy_text).then(function () {
            alert("Copy to clipboard successful.");
        }, function (err) {
            alert("Copy to clipboard fail!");
        });
    })

    $("#download-txt").click(function () {
        // console.log("download txt");
        // console.log(this);
        this.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(copy_text));
        this.setAttribute('download', "cloze.txt");
    })

    $("#download-json").click(function () {
        // console.log("download json");
        // console.log(this);
        this.setAttribute('href', 'data:json/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(json_obj)));
        this.setAttribute('download', "cloze.json");
    })
})