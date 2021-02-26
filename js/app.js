const params = {
  'uri': "https://video.tv-tokyo.co.jp/personal/",
};

const basePixelUri = "https://in.treasuredata.com/postback/v3/event/simid/simid_survey_result?td_format=pixel&td_write_key=8916/67294c614f548801ce3c9d970c78865b22deb236&survey_id=__SURVEY_ID__&answer_data=__ANSWER_DATA__&td_global_id=td_global_id&td_ip=td_ip&td_ua=td_ua&adid=__DEVICE_ID__&event=__EVENT__&device=__DEVICE__&vpos=__VPOS__&platform=__PLATFORM__&vid=__VID__";
var pixels = {
  'trackingUrls' : []
}
// タイムスタンプ生成
var timestamp = new Date().getTime();

// 送信可能フラグ
var submitFlg;

// 回答
var answer_data = [];

// イベント
var event = "1";

// デバッグ用
var debugElement = document.getElementById("debug_area");
// var debugElement = navigator.userAgent;

// app or Pc
var deviceType = "";

// adParameters
var adParameters = "";

// 時間
var simidDuration = 60000;

// 時間のバッファ
var timeBuffer = 0;

let promise ;

// 質問数
var tempOptionsVal = 0;

class SimidController extends BaseSimidCreative {
  // コンストラクタ
  constructor() {
    // セッション開始
    super();
  }

  // アンケートスキップ
  skip(){
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_SKIP);
  }
  
  // プラポリオープン
  privacy(){
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_NAVIGATION, params );
  }

  // ピクセルタグ呼び出し
  post(tempPixels){
    var result = this.simidProtocol.sendMessage(CreativeMessage.REQUEST_TRACKING, tempPixels );
    var that = this;
    result.then(function() {
      that.skip();
    });
  }

  // フルスクリーン
  fullscreen(){
    this.simidProtocol.sendMessage(CreativeMessage.REQUEST_FULL_SCREEN);
  }

  /*@override*/
  onStart(eventData) {
    adParameters = JSON.parse(this.creativeData.adParameters);
    $.when(
      super.onStart(eventData)
    ).done(function() {
      main();
    }).fail(function() {
      // エラーが発生したときの処理
    });
  }

}


// SIMID制御クラス
const simidController = new SimidController();


// SIMIDセッションスタート
simidController.ready()


function main(){



  var vue =  new Vue({
    el: '#simid_creative',
    data: {
      all_data:[],
      show_data:[],
      question_list: [],
      answer_list:[]
    },
    created: function () {
      axios.get('./json/question.json?timestamp=' + timestamp).then(function (response) {
      tempOptionsVal = 0;
      // 取得完了したらlistリストに代入
      this.all_data = response.data.filter(function(data, index){
        tempOptionsVal++;
        if(adParameters.surveyid == data.surveyId){
          return true;
        }
      })

      }.bind(this)).catch(function (e) {
        console.error(e)
      });
    },
    updated: function () {

      // 要素を読み込んだ段階でimpレコード
      postPixel("1");

      // 要素を読み込んだら表示
      if(this.all_data[0].answers.length > 4){
        $("#simid_creative .options ul").addClass("three_row");
      }else{
        $("#simid_creative .options ul").addClass("two_row");
      }
      $("#simid_creative").addClass("show");


  

      // タイマー開始
      $(function () {
        maxBar = $('#bar').attr('max');
        resetTimer();
        timer = setInterval('countdown()', resolutionMs);
      });

      // ボタン処理
      $(function(){

        // サブミットボタン or スキップボタン押下
        $("#button_submit").click(function(){
            if(submitFlg){

              // チェック済みvalue値を取得する
              $("input:checked").each(function() {
                answer_data.push($(this).val());
              })
              
              // ピクセルタグを送信  2=回答
              postPixel("2")

              // 送信完了したら残りの広告はスキップ
              // setTimeout(setSkip, 1000);
            }else{
              // 広告スキップ

              // ピクセルタグを送信 //スキップ
              postPixel("3")
              // setTimeout(setSkip, 1000);
            }
            return false;
        });

        // プラポリ
        $("#button_privacy").click(function(){
          simidController.privacy();
          return false;
        });

        // フルスクリーン
        $("#button_fullscreen").click(function(){
          simidController.fullscreen();
          return false;
        });

        // チェックが付いた時の処理
        $("input[type=checkbox]").click(function(){
            var $count = $("input[type=checkbox]:checked").length;
            var $not = $('input[type=checkbox]').not(':checked');
        
            //チェックが3つ付いたら、チェックされてないチェックボックスにdisabledを加える
            if($count >= 1) {
                $not.attr("disabled",true);
                $not.parent().css('opacity',0.6);

                // スキップボタンを送信ボタンに変更
                submitFlg ="1";
                $("#button_submit").css("background-color","#a92f61");
                $("#button_submit span").text("アンケートを送信する")

            }else{
                $not.attr("disabled",false);
                $not.parent().css('opacity',1);

                // スキップボタンを送信ボタンに変更
                submitFlg ="0";
                $("#button_submit").css("background-color","inherit");
                $("#button_submit span").text("アンケートをスキップ")
            }
        });

      });



    },
    methods: {

    }
  })
}


// タイマー関連関数
var timer,
  limitMs = 0,
  restMs = 0,
  resolutionMs = 50,    /* NOTE: Too small value does not work on IE11. */
  maxBar;

function countdown(){
  restMs -= resolutionMs;

  var restRate = (limitMs - restMs) / limitMs;
  var restBarLength = maxBar * restRate

  $('#bar').attr('value', restBarLength);

  if (restMs < 0) {
    //　タイムアウト
    // postPixel();
    // setTimeout(setSkip, 500);
  }
}

function resetTimer(){
  clearInterval(timer);
  // limitMs = restMs = $('#time').val();
  // limitMs = restMs = "60000";
  limitMs = restMs = String(simidDuration+timeBuffer);
  $('#bar').attr('value', 0);
}


// チェック済みvalue値を取得する
$('input:checked').each(function() {
  var r = $(this).val();
})

function postPixel(postEvent){
  var tempPixel ;

  tempPixel = basePixelUri;

  if(postEvent){
    event = postEvent;
  }

  // デバイス種別取得
  deviceType = getAppOrWeb();
  $.when(
    tempPixel = tempPixel.replace("__SURVEY_ID__",adParameters.surveyid),
    tempPixel = tempPixel.replace("__DEVICE_ID__",adParameters.identifer),
    tempPixel = tempPixel.replace("__PLATFORM__",adParameters.platform),
    tempPixel = tempPixel.replace("__VID__",adParameters.vid),
    tempPixel = tempPixel.replace("__VPOS__",adParameters.vpos),
    tempPixel = tempPixel.replace("__EVENT__",event),
    tempPixel = tempPixel.replace("__DEVICE__",deviceType),
    tempPixel = tempPixel.replace("__ANSWER_DATA__",JSON.stringify(answer_data))
  )
  .done(function() {
    // pixels配列に追加
    pixels.trackingUrls.push(tempPixel);
    if(event != "1"){
      globalPost();
    }
  })
}


function getAppOrWeb(){
  if (navigator.userAgent.indexOf('iPhone') > 0 || navigator.userAgent.indexOf('Android') > 0 || navigator.userAgent.indexOf('Mobile') > 0 || navigator.userAgent.indexOf('iPad') > 0 || navigator.userAgent.indexOf('Android') > 0 || navigator.userAgent.indexOf('Mobile') > 0) {
    return "1";
  } else {
    return "2";
  }
}

function globalPost(){
  simidController.post(pixels);
}

function setSkip(){
  simidController.skip();
}

function stopTimer(){
  clearInterval(timer);
}
function resumeTimer(){
  timer = setInterval('countdown()', resolutionMs);
}

// ページ離脱処理
window.addEventListener('beforeunload', unloaded, false);
function unloaded(){
  globalPost();
}