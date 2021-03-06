/*
感謝您觀看這份程式碼
作品名稱: Sentiment analysis
作者: 陳光穎 Bruce Chen
聯絡方式
  Facebook連結: https://www.facebook.com/bruce.chen.372
  LINE ID: brucechen0
最後修改日期: 2017/9/1
版本: 1.0.0.0
發表於: https://brucechen034020.github.io/
程式碼尺度
  N/A
作者註解:
  1. 如本網頁有 bug 請用 Facebook(Messenger) 通知 Bruce Chen，謝謝。
  2. 如有任何建議，請用 Facebook(Messenger) 通知 Bruce Chen，謝謝。
*/

/* Global variables */

/* hidden_1_layer 2017x500
   hidden_2_layer 500x500
   hidden_3_layer 500x500
   output_layer 500x2
   lexicon 2017 */
   inputExist = []; // whether the input cell of a given number exists (bool)
  outputExist = []; // whether the output cell ....... (bool)
   textBoxes = []; // input cells (textarea)
  buttons = []; // Submit button (Button)
  labels = []; // Input labels (labels)
  outputs = []; // output cells (labels)
  var gf; // (girlfriend)
  var lemmitized_log; // record the lemmatized array
  var outputs2 = []; // output cells 2nd line (labels)

/* p5 functions */
function setup(){
  /* Welcome message */
  // alert("Requirements:\r\n  Free RAM 0.15 GB 以上\r\nIf your hardware does not meet the requirement, close this window. This program is not able to run on your advice.")
  console.log(hidden_1_layer)
  console.log(hidden_2_layer)
  console.log(hidden_3_layer)
  console.log(output_layer)
  console.log(lexicon)
  var p = document.getElementById("loading");
  p.remove();
  for(var i=0; i<2000; i++){
    inputExist[i] = false;
  }
  createInputCell(1);
  /*var s = "1234";
  s = s.slice(1);
  console.log(s.endsWith('4'));*/
  gf = new girlfriend(); // 工具人
  console.log(localStorage);
  localStorage.clear();
  console.log(localStorage);
}

function draw(){
}

/* User defined functions */
function createInputCell(index){ // index = (int)
  if(!inputExist[index]){
    inputExist[index] = true;

    createP('');

    labels[index] = document.createElement("label");
    document.body.appendChild(labels[index]);
    labels[index].id = index;
    writeText(labels[index], "In[" + index + ']');

    textBoxes[index] = document.createElement("textarea");
    document.body.appendChild(textBoxes[index]);
    textBoxes[index].id = index;
    
    textBoxes[index].cols *= 6;

    createP('');

    buttons[index] = document.createElement("button");
    document.body.appendChild(buttons[index]);
    buttons[index].id = index;
    buttons[index].addEventListener("click", run);
    writeText(buttons[index], "Submit");
    
    createP('');
  }
}

function run(sender){
  var n = parseInt(sender.target.id);
  lemmitized_log = "";

  if(!outputExist[n]){
    outputs[n] = document.createElement("label");
    document.body.appendChild(outputs[n]);
    outputExist[n] = true;
    
    createP('');

    outputs2[n] = document.createElement("label");
    document.body.appendChild(outputs2[n]);
  }
  setText(outputs[n], "Calculating.....");
  setText(outputs2[n], "");
  
  createP('');
  setTimeout(function(){
  res = use_neural_network(n);
  setText(outputs[n], "Sentiment: ")
  writeText(outputs[n], res);

  setText(outputs2[n], "Autodecode: ")
  writeText(outputs2[n], lemmitized_log);

  createInputCell(n+1);
  }, 20);
}

function use_neural_network(index){
  var hm_lines = 10000000;

  var features = [];
  features[0] = input_handling(textBoxes[index].value, index);

  if(features[0].length === 0){
    res = "English only.\r\nIt seems the sentence you entered is not written in English. This program fails to understand your sentence. \r\n本程式不支援中文， sorry for the inconvenience.";
    return res;
  }
  var prediction = neural_network_model(features);
  console.log("positive score = " + prediction[0][0]);
  console.log("negative score = " + prediction[0][1]);

  var answer = gf.argmax(prediction[0]);

  if(answer === 0){
    console.log("positive");
    return "Positive";
  }else if(answer === 1){
    console.log("negative");
    return "Negative";
  }else{
    alert("Error:\r\nmain.use_neural_network");
  }
}

function input_handling(input, input_index){
  var lemmatizer = new Lemmatizer();
  var featureset = [];
  var current_words = gf.word_tokenize(input);
  console.log("tokenized: ");
  console.log(current_words);
  if(gf.isEmpty(current_words)){
    console.log("current words empty");
    return featureset;
  }
  var current_words2 = [];
  for(var i=0; i<current_words.length; i++){
    if(gf.isEmpty(lemmatizer.lemmas(current_words[i]))){
      console.log("Fail to lemmatize: " + current_words[i] + " -> " + lemmatizer.lemmas(current_words[i]));
    }else{
       var l = lemmatizer.lemmas(current_words[i])[0][0] ;
       console.log("lemmatize: " + current_words[i] + " -> " + l);
       l = l.toLowerCase();
       current_words2.push(l);
       lemmitized_log += l + " ";
    }
  }
  if(gf.isEmpty(lemmitized_log)){
    return featureset;
  }
  console.log("lemmatized: ")
  console.log(current_words2);
  var features = gf.zeros(lexicon.length);
  lemmitized_log = "";  

  gf.lemmatize_error_fix(current_words, current_words2);
  console.log("Lemmitize error fixed: ");
  console.log(current_words2);

  for(var i=0; i<current_words2.length; i++){
    word = current_words2[i].toLowerCase();

    if(isIn(word, lexicon)){
      index_value = gf.index(lexicon, word);
      features[index_value] += 1;
      lemmitized_log += word + " ";
    }
  }
  
  if(gf.isEmpty(lemmitized_log)){
    return featureset;
  }
  console.log("features: ");
  console.log(features);
  return features;
}

function neural_network_model(data){
  console.log("feature data matrix: ");
  console.log(data);
  l1 = gf.add(hidden_1_layer['biases'], gf.matmul(data, hidden_1_layer['weights']));
  l1 = gf.relu(l1);

  l2 = gf.add(hidden_2_layer['biases'], gf.matmul(l1, hidden_2_layer['weights']));
  l2 = gf.relu(l2);

  l3 = gf.add(hidden_3_layer['biases'], gf.matmul(l2, hidden_3_layer['weights']));
  l3 = gf.relu(l3);

  output = gf.add(output_layer['biases'], gf.matmul(l3, output_layer['weights']));

  return output;
}

