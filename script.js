"use strict";

// イベント登録 //

// リストの親（リスナー）
const listArea=document.getElementById("list-area");
listArea.addEventListener("click",
    (e)=>{
        const button = e.target.closest("button");
        if(!button) return;

        const list = button.closest(".list");

        if(button.classList.contains("task-crt-button"))
        {
            console.log("タスク追加!");
        }
        else if(button.classList.contains("list-clear-button"))
        {
            console.log("リスト空にする！");
        }
        else if(button.classList.contains("list-delete-button"))
        {
            console.log("リスト削除!");
        }
    });

// リスト追加ボタン
const list_create=document.getElementById("list-create"); 
      list_create.addEventListener("click", ListCreate);

// 関数定義

function ListCreate()
{
    const listContainer=document.createElement("div");
    listContainer.classList.add("list");

    listContainer.innerHTML=
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
    `;

    // HTMLのどこに追加するかを決める
    document.getElementById("list-area").appendChild(listContainer);
}