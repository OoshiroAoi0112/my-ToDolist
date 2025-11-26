// ミスチェック //
"use strict";

///// 変数定義 /////
/// 効果音 ///
// クリック
const clickSound = new Audio("sound/cursor.mp3");
clickSound.volume = 0.3;
// リストを空にする音
const clearSound = new Audio("sound/clear.mp3");
clickSound.volume = 0.7;
// 達成度が100％になったときの音
const taskcmpSound = new Audio("sound/taskcmp.mp3");
taskcmpSound.volume = 0.5;
// 警告文を表示させるときの音
const warningSound = new Audio("sound/warning.mp3");
warningSound.volume = 0.7;
// タスクを削除するときの音
const taskdltSound = new Audio("sound/taskdelete.mp3");
taskdltSound.volume = 0.5;
// ☆ 学習メモ ☆　//
//                     const : 再代入不可の変数を作成
// document.getElementById() : HTML要素を取得 (今回はid)

// リスト作成ボタン
// HTMLから id=list-area の要素検索・取得
const listArea = document.getElementById("list-area");
// タスクの追加、リストのリセット、リストの削除ボタン
// HTMLから id=list-create の要素検索・取得
const listCreateBtn = document.getElementById("list-create-button");

//----------------------------------------------------------//

///// イベント登録 ///////

// ☆ 学習メモ ☆ //
// ・listCreateBtnは要素を取得しているのでそれを操作する関数が使えるらしいぞ。
//
// addEventListener("click", ListCreate, false) 解説は↓
// addEventListener() : 入力によりイベントを実行させたい場合に使用。
//                    　引数は(入力の種類, 実行したい関数名, イベントの伝搬方式)となっている
//              click : 今回はaddEventListenerの第一引数で使用した。入力イベントの1つ
//                      他にもマウス全般、キーボード全般、スクロール、
//                      webページの読み込みなど様々なイベントに対応できる
//         ListCreate : 呼び出したい関数名。()は付けない
//              flase : バブリング段階で処理。デフォでもfalseのため基本書かないらしい
//
// ・イベント委譲について。ボタンが最初から配置されていない、JSで追加で配置される場合に
// 　使用する。あらかじめアクションを拾うためのidをHTML内に用意する。
// 　どの要素にアクションが発生したのかを内部で判定する必要がある。
// ・listArea.addEventListener("click", (e) => {}, false) 解説は↓
//         listArea : 事前に作っておいた変数
// addEventListener : 上記参照
//            click : 上記参照
//              (e) : 登録する関数のイベントなどの情報を格納するための変数。変数名は e である必要は無い
//               {} : 中には実行したい関数の処理を書き込む
//            false : 上記参照

listCreateBtn.addEventListener("click", ListCreate, false);

// イベント委譲（クリック）
listArea.addEventListener("click", (e) => {
  // リスト名・タスク名のラベルがクリックされたか判定
  const label = e.target.closest(".list-text-label, .task-text-label");
  if(label)
  {
    const currentText = label.textContent;

    // 新しく input を作る
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.spellcheck = false;
    input.autocomplete = "off";

    // どっち用のラベル化でクラスを変える
    if(label.classList.contains("list-text-label"))
    {
      input.classList.add("list-text-write");
      input.maxLength = 20;
    }
    else
    {
      input.classList.add("task-text-write");
      input.maxLength = 30;
    }

    // span → input に入れ替え
    label.replaceWith(input);

    // フォーカスして中心全部選択
    input.focus();
    input.select();

    return;
  }

  const button = e.target.closest("button");
  // ボタン(<button>)かどうかを判定
  if (!button) return;

  // (.list)を持つ要素を探す
  const list = button.closest(".list"); // どのリスト内の操作か
  if (!list) return;

  // 押されたボタン(<button>)のクラス名で呼び出す関数を変える
  if (button.classList.contains("task-crt-button")) {
    TaskCreate(list); // ← タスク生成は別関数
  } else if (button.classList.contains("list-clear-button")) {
    ClearList(list);
  } else if (button.classList.contains("list-delete-button")) {
    DeleteList(list);
  } else if (button.classList.contains("task-delete-button")) {
    const task = e.target.closest("li.task");
    const list = task.closest(".list");
    DeleteTask(list, task);
  }
}, false);


document.addEventListener("click", (e) =>
{
  // 効果音
  playSound(clickSound);
  
  // エフェクト要素の作成
  const effect = document.createElement("span");
  effect.className = "click-effect";

  // クリックした位置をセット（画面上の座標）
  effect.style.left = e.pageX + "px";
  effect.style.top = e.pageY + "px";

  // 画面に追加
  document.body.appendChild(effect);

  // アニメーションが終わったら自動で消す
  effect.addEventListener("animationend", () =>
  {
    effect.remove();
  });
});
  
// イベント委譲（値(state)の変更）
listArea.addEventListener("change", (e) => {
  // インプットテキストの情報取得
  const textInput = e.target.closest("input.task-text-write, input.list-text-write");
  if(textInput)
  {
    // 文字列の切り取り
    const value = textInput.value.trim();
    // 文字列があることを確認
    if(value === "") return;
    {
      // span 要素の作成と文字列の代入
      const span = document.createElement("span");
      // 作成した span 要素にクラスを付与
      span.className = textInput.classList.contains("task-text-write")
      ? "task-text-label"
      : "list-text-label";
      // span のテキスト要素に文字列を代入
      span.textContent = value;

      // input → span に置き換え
      textInput.replaceWith(span);

      // 他の処理にはいかない
      return;
    }
  }

  // チェックボックスの情報取得
  const checkbox = e.target.closest('input[type="checkbox"].task-check-button');

  // チェックが押されたタスクを取得とクラスの付与
  const task = checkbox.closest("li.task");
  if(task)
  {
    // チェックボックスの状態を確認
    if(checkbox.checked)
    {
      // チェックボックスが true ならクラスに done を追加
      task.classList.add("done");
    }
    else
    {
      // チェックボックスが false ならクラスから done を削除
      task.classList.remove("done");
    }
  }

  // このチェックボックスが属しているリストを特定
  const list = checkbox.closest(".list");
  if(!list) return;

  // 達成度を更新
  UpdateAchv(list);
}, false);

//----------------------------------------------------------//

///// 関数定義 /////

// リスト追加関数
function ListCreate()
{
    // JSで新しく<div>要素を作成し、その要素をlistContainerという変数に代入している
    const listContainer = document.createElement("div");
    // クラス"list"を追加
    listContainer.classList.add("list");
    // 実行したいHTML分を変数にまとめて入れる
    listContainer.innerHTML =
    `
    <div class="list-header">
        <label>
          <input 
          type="text"
          class="list-text-write"
          maxlength="20"
          placeholder="ここにリスト名を記入"
          spellcheck="false"
          autocomplete="off">
        </label>
        <div class="list-achv">
          <p>達成度：<span class="achv-num">0%</span></p>
        </div>
    </div>
    <div class="list-button">
      <div class="task-crt">
        <button type="button" class="task-crt-button">タスクを追加</button>
      </div>
      <div class="list-clear">
        <button type="button" class="list-clear-button">空にする</button>
      </div>
      <div class="list-delete">
        <button type="button" class="list-delete-button">リストを削除</button>
      </div>
    </div>
    <ul class="task-list"></ul>
    `;

    // HTMLのどこに追加するかを決める
    document.getElementById("list-area").appendChild(listContainer);
}

// タスク追加関数
function TaskCreate(list)
{
  // ul class = "task-list"を探す
  const ul = list.querySelector(".task-list");
  if(!ul) return;
  // JSで新しく<li>要素を作成
  const li = document.createElement("li");
  li.classList.add("task");
  // 実行したいHTML分を変数にまとめて入れる
  li.innerHTML =
  `
  <div class="task-main">
    <div class="task-check">
      <label class="round-check">
        <input type="checkbox" class="task-check-button">
        <span class="circle"></span>
      </label>
    </div>
    <div class="task-text">
      <label>
        <input 
        type="text"
        class="task-text-write"
        maxlength="30"
        placeholder="ここにタスク名を記入"
        spellcheck="false"
        autocomplete="off">
      </label>
    </div>
  </div>
  <div class="task-delete">
    <button type="button" class="task-delete-button">タスクを削除</button>
  </div>
  <ul class="task-list">
  </ul>
  `;

  // 完成したliをulに追加
  ul.appendChild(li);
  // 達成度を更新
  UpdateAchv(list);
}


// リスト内を空にする
async function ClearList(list)
{
  // listないある.task-listを探す
  const ul = list.querySelector(".task-list");
  if(!ul) return;

  const taskCount = list.querySelectorAll(".task-list > li.task").length;

  if(taskCount > 0)
  {
    playSound(warningSound);
    const ok = await ShowModal(`このリストには ${taskCount}件のタスクがあります。本当に空にしますか？`);
    if(!ok) return;
    playSound(clearSound);
  }
  
  // 中身を空にする
  ul.innerHTML = "";

  // 達成度をリセット
  UpdateAchv(list);
}

// リストを削除する
async function DeleteList(list)
{
  // リスト内のタスクの数を数える
  const taskCount = list.querySelectorAll(".task-list > li.task").length;

  // タスクがあるなら確認ダイアログ
  if(taskCount > 0)
  {
    playSound(warningSound);
    const ok = await ShowModal(`このリストには ${taskCount}件のタスクがあります。本当に空にしますか？`);
    if(!ok) return;
    playSound(taskdltSound);
  }

  // リストを削除
  list.remove();

  // リストを追加ボタンへフォーカス
  const createBtn = document.getElementById("list-create");
  if(createBtn) createBtn.focus();
}

async function DeleteTask(list, task)
{
  // タスクがあるかチェック
  if(!task) return;
  // 警告音
  playSound(warningSound);
  // 警告文
  const ok = await ShowModal(`このタスクを削除しますか？`);
  // ok ではないなら何もしない
  if(!ok) return;
  // 削除音
  playSound(taskdltSound);
  // 引数に渡された task の削除
  task.remove();
  // 達成度更新
  UpdateAchv(list);
}

// 達成度を更新する
function UpdateAchv(list)
{
  // リスト内の要素を取得 //
  // list 内の .task-list を取得
  const ul = list.querySelector(".task-list");
  // list 内の .achv-num を取得
  const span = list.querySelector(".achv-num");

  // どちらかが欠けている構造の場合はスキップ
  if(!ul || !span) return;

  // 総タスク数
  const total = ul.querySelectorAll("li.task").length;

  // 0件なら 0% 表示で終了
  if(total === 0)
  {
    span.textContent = "0%";
    return;
  }

  // 完了（チェック済み）数
  const done = ul.querySelectorAll('input.task-check-button:checked').length;

  // パーセント = (完了 / 総数) * 100 を四捨五入
  const percent = Math.round((done / total) * 100);

  if(percent === 100) playSound(taskcmpSound);

  // 表示を更新
  span.textContent = `${percent}%`;
}


// 効果音を鳴らす用
function playSound(audio)
{
  if(!audio) return;

  // 元データをクローンして毎回あたらしいAudioとして鳴らす
  const s = audio.cloneNode();
  s.volume = audio.volume;

  // 再生
  s.play().catch(()=>{});
}

// モーダルによる警告文の表示
function ShowModal(message)
{
  return new Promise(resolve => {
    const overlay = document.getElementById("modal-overlay");
    const boxMsg  = overlay.querySelector(".modal-message");
    const okBtn   = overlay.querySelector(".modal-ok");
    const cancelBtn  = overlay.querySelector(".modal-cancel");

    // メッセージをセット
    boxMsg.textContent = message;

    // 表示
    overlay.classList.remove("hidden");

    // OK
    const onOk = () => {
      cleanup();
      resolve(true);
    };

    // キャンセル
    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    // 後処理
    function cleanup(){
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.classList.add("hidden");
    }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
  });
}

//----------------------------------------------------------//