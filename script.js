// ミスチェック //
"use strict";

///// 変数定義 /////
let isLoading = false;
let draggingTask = null;
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
// 現在あるリストをすべて削除
// HTMLから id=all-delete-button の要素検索・取得
const allDeleteBtn = document.getElementById("all-delete-button");

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

listCreateBtn.addEventListener("click", () => {
  ListCreate();
}, false);

allDeleteBtn.addEventListener("click", () => {
  DeleteAllLists();
}, false);

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

    // ★ ここを追加：フォーカスが外れたら必ず change を発火させる
    input.addEventListener("blur", () => {
      const ev = new Event("change", { bubbles: true });
      input.dispatchEvent(ev);
    });

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

// イベント委譲（ドラッグ＆ドロップ）
listArea.addEventListener("dragstart", (e) => {
  const task = e.target.closest("li.task");
  if(!task) return;

  // ドラッグしているタスクを記録
  draggingTask = task;

  // 一部ブラウザ用
  if(e.dataTransfer)
  {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  }
}, false);

listArea.addEventListener("dragover", (e) => {
  // デフォルトのドロップ禁止を無効化する
  if(!draggingTask) return;

  const task = e.target.closest("li.task");
  if(!task) return;

  const ul = task.closest(".task-list");
  if(!ul) return;

  // 同じリスト内のときは許可
  const draggingUl = draggingTask.closest(".task-list");
  if(draggingUl !== ul) return;

  e.preventDefault();
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
    // タスクかリストか判定
    const isTask = textInput.classList.contains("task-text-write");
    // 文字列の切り取り
    let value = textInput.value.trim();
    // 文字列があることを確認
    if(value === "")
    {
      value = isTask
      ? "タスク名を入力してください"
      : "リスト名を入力してください";
    }
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

    SaveAll();
    // 他の処理にはいかない
    return;
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
  SaveAll();
}, false);

listArea.addEventListener("drop", (e) => {
  if(!draggingTask) return;

  const targetTask = e.target.closest("li.task");
  if(!targetTask) return;

  const ul = targetTask.closest(".task-list");
  if(!ul) return;

  const draggingUl = draggingTask.closest(".task-list");
  if(draggingUl !== ul) return;

  if(draggingTask === targetTask) return;

  const tasks = Array.from(ul.querySelectorAll("li.task"));
  const fromIndex = tasks.indexOf(draggingTask);
  const toIndex   = tasks.indexOf(targetTask);

  if(fromIndex < 0 || toIndex < 0) return;

  if(fromIndex < toIndex)
  {
    ul.insertBefore(draggingTask, targetTask.nextSibling);
  }
  else
  {
    ul.insertBefore(draggingTask, targetTask);
  }

  const list = ul.closest(".list");
  if(list)
  {
    UpdateAchv(list);
  }

  SaveAll();

  draggingTask = null;

  e.preventDefault();
}, false);

listArea.addEventListener("dragend", () => {
  draggingTask = null;
}, false);

//----------------------------------------------------------//

///// 関数定義 /////

// リスト追加関数
function ListCreate(title = "")
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

    // 復元時にタイトルを反映
    const titleInput = listContainer.querySelector(".list-text-write");
    if(titleInput)
    {
      if(title !== "")
      {
        const span = document.createElement("span");
        span.className = "list-text-label";
        span.textContent = title;
        titleInput.replaceWith(span);
      }
      else
      {
        titleInput.value = "";
      }
    }

    SaveAll();
    return listContainer;
}

async function DeleteAllLists()
{
  // リストが一つもなければ終了
  const listArea = document.getElementById("list-area");
  if(!listArea) return;

  const list = listArea.querySelectorAll(".list");
  const count = list.length;

  // 
  if(count === 0)
  {
    return;
  }

  // 確認用ダイアログ
  playSound(warningSound);
  const ok = await ShowModal(`現在${count} 件のリストがあります。本当に全て削除しますか？`);
  if(!ok) return;
  
  // 効果音
  playSound(taskdltSound);

  // すべてのリストを削除
  list.forEach(list => list.remove());

  const createBtn = document.getElementById("list-create-button");
  if(createBtn) createBtn.focus();

  // 削除後保存
  SaveAll();
}

// タスク追加関数
function TaskCreate(list, text = "")
{
  // ul class = "task-list"を探す
  const ul = list.querySelector(".task-list");
  if(!ul) return;

  // JSで新しく<li>要素を作成
  const li = document.createElement("li");
  li.classList.add("task");

  // ドラッグ可能にする
  li.draggable = true;

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

  // 復元時にタスク名を追加
  const taskInput = li.querySelector(".task-text-write");
  if(taskInput)
  {
    if(text !== "")
      {
        const span = document.createElement("span");
        span.className = "task-text-label";
        span.textContent = text;
        taskInput.replaceWith(span);
      }
      else
      {
        taskInput.value = "";
      }
  }

  // 達成度を更新
  UpdateAchv(list);
  SaveAll();

  return li;
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
  SaveAll();
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
  SaveAll();
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
  SaveAll();
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

// 保存機能
const STORAGE_KEY = "todo-data";

// すべてのリストを localStorage に保存する
function SaveAll()
{
  if(isLoading)
  {
    return;
  }

  const listArea = document.getElementById("list-area");
  if(!listArea) return;
  
  // #list-area の中にある .list を全部集める
  const listElems = listArea.querySelectorAll(".list");

  const allData = [];

  listElems.forEach(listEl => {
    // リスト名取得
    let title = "";

    // ラベル表示型
    const titleLabel = listEl.querySelector(".list-text-label");
    if(titleLabel)
    {
      title = titleLabel.textContent.trim();
    }

    // 
    const titleInput = listEl.querySelector(".list-text-write");
    if(!title && titleInput)
    {
      if("value" in titleInput)
      {
        title = titleInput.value.trim();
      }
      else
      {
        title = titleInput.textContent.trim();
      }
    }

    // タスク一覧の取得
    const tasks = [];

    const taskElems = listEl.querySelectorAll(".task-list > li.task, li.task");

    taskElems.forEach(taskEl => {
      let text = "";

      const textLabel = taskEl.querySelector(".task-text-label");
      if(textLabel)
      {
        text = textLabel.textContent.trim();
      }

      const textInput = taskEl.querySelector(".task-text-write");
      if(!text && textInput)
      {
        if("value" in textInput)
        {
          text = textInput.value.trim();
        }
        else
        {
          text = textInput.textContent.trim();
        }
      }

      const checkbox = taskEl.querySelector('input[type="checkbox"]');
      const done =
        taskEl.classList.contains("done") ||
        (checkbox ? checkbox.checked : false);

      tasks.push({text, done});
    });
    allData.push({title, tasks});
  });
  try
  {
    const json = JSON.stringify(allData);
    localStorage.setItem(STORAGE_KEY, json);
  }
  catch(err)
  {
    console.error("保存に失敗しました。", err);
  }
}


// 復元機能
function LoadAll()
{
  const json = localStorage.getItem(STORAGE_KEY);
  if(!json)
  {
    return;
  }

  let data;
  try
  {
    data = JSON.parse(json);
  }
  catch(e)
  {
    console.error("復元データの読み込みに失敗しました：", e);
    return;
  }

  if(!Array.isArray(data))
  {
    console.warn("復元データの形式が想定と違います：", data);
    return;
  }

  const listArea = document.getElementById("list-area");
  if(!listArea) return;

  // 一旦全部クリアしてから復元
  listArea.innerHTML = "";

  data.forEach(listData =>{
    const title = listData.title || "";
    const tasks = Array.isArray(listData.tasks) ? listData.tasks : [];
    //
    const listEl = ListCreate(title);

    //
    tasks.forEach(taskData =>{
      const text = taskData.text || "";
      const done = !!taskData.done;

      //
      const taskEl = TaskCreate(listEl, text);

      //
      if(done)
      {
        taskEl.classList.add("done");

        const checkbox = taskEl.querySelector('input[type="checkbox"]');
        if(checkbox)
        {
          checkbox.checked = true;
        }
      }
    }) ;

    //
    UpdateAchv(listEl);
  });
}

// 復元イベント
window.addEventListener("DOMContentLoaded", () => {
  isLoading = true;
  LoadAll();
  isLoading = false;
});