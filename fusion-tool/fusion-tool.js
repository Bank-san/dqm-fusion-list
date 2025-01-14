document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("fusionTable");
  const searchInput = document.getElementById("searchInput");
  const tagButtons = document.querySelectorAll(".tag-button");
  const scopeButtons = document.querySelectorAll(".search-scope-button");
  const suggestionsDiv = document.getElementById("suggestions");
  const matchButtons = document.querySelectorAll(".search-match-button");
  let selectedIndex = -1;

  // 既存の変数宣言に追加
  const noteToggleButton = document.querySelector(".note-toggle-button");
  const noteColumn = document.querySelectorAll(".note-column");

  // 備考欄トグルボタンのクリックイベント
  noteToggleButton.addEventListener("click", () => {
    const isShowing = noteToggleButton.dataset.show === "true";
    noteToggleButton.dataset.show = (!isShowing).toString();
    noteToggleButton.classList.toggle("active");
    noteToggleButton.textContent = isShowing
      ? "備考欄を表示"
      : "備考欄を非表示";

    // テーブルヘッダーとセルの表示/非表示を切り替え
    document.querySelectorAll(".note-column").forEach((cell) => {
      cell.classList.toggle("visible");
    });
  });

  // 検索範囲ボタンのクリックイベント
  scopeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // 他のボタンのアクティブ状態を解除
      scopeButtons.forEach((btn) => {
        if (btn !== button) {
          btn.classList.remove("active");
        }
      });

      // 現在のボタンのアクティブ状態を切り替え
      button.classList.toggle("active");

      // 検索を実行
      performSearch();
    });
  });

  // タグボタンのクリックイベント
  tagButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // 他のボタンのアクティブ状態を解除
      tagButtons.forEach((btn) => {
        if (btn !== button) {
          btn.classList.remove("active");
        }
      });

      // 現在のボタンのアクティブ状態を切り替え
      button.classList.toggle("active");

      // 検索を実行
      performSearch();
    });
  });

  // モンスター名の一覧を作成（重複を除去）
  function getAllMonsterNames() {
    const names = new Set();
    data.forEach((row) => {
      if (row[1]) names.add(row[1]); // 子
      if (row[2]) names.add(row[2]); // 血統
      if (row[3]) names.add(row[3]); // 相手
    });
    return Array.from(names).sort();
  }

  // サジェストを表示する関数
  function showSuggestions(query) {
    if (!query) {
      suggestionsDiv.style.display = "none";
      return;
    }

    const searchScope =
      document.querySelector(".search-scope-button.active")?.dataset.scope ||
      "child";
    const matchType =
      document.querySelector(".search-match-button.active")?.dataset.match ||
      "partial";
    const monsterNames = getAllMonsterNames();

    // 検索範囲に応じてフィルタリング
    const filteredNames = monsterNames.filter((name) => {
      const matchesQuery =
        matchType === "exact"
          ? name.toLowerCase() === query.toLowerCase()
          : name.toLowerCase().includes(query.toLowerCase());

      if (searchScope === "child") {
        // 子モンスターのみから検索
        return data.some((row) => row[1] === name) && matchesQuery;
      } else {
        // 血統と相手から検索
        return (
          data.some((row) => row[2] === name || row[3] === name) && matchesQuery
        );
      }
    });

    if (filteredNames.length === 0) {
      suggestionsDiv.style.display = "none";
      return;
    }

    suggestionsDiv.innerHTML = "";
    filteredNames.slice(0, 10).forEach((name, index) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.textContent = name;
      div.addEventListener("click", () => {
        searchInput.value = name;
        suggestionsDiv.style.display = "none";
        performSearch();
      });
      suggestionsDiv.appendChild(div);
    });

    suggestionsDiv.style.display = "block";
    selectedIndex = -1;
  }

  // キーボードナビゲーション
  searchInput.addEventListener("keydown", (e) => {
    const items = suggestionsDiv.getElementsByClassName("suggestion-item");

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
        break;
      case "ArrowUp":
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          searchInput.value = items[selectedIndex].textContent;
          suggestionsDiv.style.display = "none";
          performSearch();
        }
        break;
      case "Escape":
        suggestionsDiv.style.display = "none";
        selectedIndex = -1;
        break;
    }
  });

  function updateSelection(items) {
    Array.from(items).forEach((item, index) => {
      item.classList.toggle("selected", index === selectedIndex);
      if (index === selectedIndex) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  // 検索入力イベントを修正
  searchInput.addEventListener("input", (e) => {
    showSuggestions(e.target.value);
    performSearch();
  });

  // クリック以外の場所をクリックした時にサジェストを非表示
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      suggestionsDiv.style.display = "none";
    }
  });

  // 検索範囲が変更された時にサジェストを更新
  scopeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (searchInput.value) {
        showSuggestions(searchInput.value);
      }
    });
  });

  // 検索方法ボタンのクリックイベント
  matchButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // 他のボタンのアクティブ状態を解除
      matchButtons.forEach((btn) => {
        if (btn !== button) {
          btn.classList.remove("active");
        }
      });

      // 現在のボタンのアクティブ状態を切り替え
      button.classList.toggle("active");

      // 検索を実行
      performSearch();
    });
  });

  // 検索を実行する関数
  function performSearch() {
    const query = searchInput.value.toLowerCase();
    const activeTag = document.querySelector(".tag-button.active")?.dataset.tag;
    const searchScope =
      document.querySelector(".search-scope-button.active")?.dataset.scope ||
      "child";
    const matchType =
      document.querySelector(".search-match-button.active")?.dataset.match ||
      "partial";

    const filteredData = data.filter((row) => {
      // テキスト検索
      let textMatch = false;
      if (searchScope === "child") {
        // 子モンスターのみを検索
        if (matchType === "exact") {
          textMatch = !query || (row[1] && row[1].toLowerCase() === query);
        } else {
          textMatch =
            !query || (row[1] && row[1].toLowerCase().includes(query));
        }
      } else {
        // 血統と相手を検索
        if (matchType === "exact") {
          textMatch =
            !query ||
            (row[2] && row[2].toLowerCase() === query) ||
            (row[3] && row[3].toLowerCase() === query);
        } else {
          textMatch =
            !query ||
            (row[2] && row[2].toLowerCase().includes(query)) ||
            (row[3] && row[3].toLowerCase().includes(query));
        }
      }

      // タグ検索
      const tagMatch = !activeTag || row[0] === activeTag;

      return textMatch && tagMatch;
    });

    updateTable(filteredData);
  }

  // テーブル更新関数を修正
  function updateTable(data) {
    tableBody.innerHTML = "";
    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4">No matches found</td></tr>';
      return;
    }

    const showNotes = noteToggleButton.dataset.show === "true";

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row[1] || ""}</td>
        <td>${row[2] || ""}</td>
        <td>${row[3] || ""}</td>
        <td class="note-column ${showNotes ? "visible" : ""}">${
        row[4] || ""
      }</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // テーブルヘッダーも修正
  const tableHeader = `
    <tr>
      <th>子</th>
      <th>血統</th>
      <th>相手</th>
      <th class="note-column">備考</th>
    </tr>
  `;
  document.querySelector("thead").innerHTML = tableHeader;

  const data = [
    ["スライム系", "ドラゴスライム", "スライム系", "ドラゴン系", ""],
    ["スライム系", "ぶちスライム", "スライム系", "獣系", ""],
    ["スライム系", "はねスライム", "スライム系", "鳥系", ""],
    ["スライム系", "スライムツリー", "スライム系", "植物系", ""],
    ["スライム系", "スライムつむり", "スライム系", "虫系", ""],
    ["スライム系", "スライムナイト", "スライム系", "悪魔系", ""],
    ["スライム系", "バブルスライム", "スライム系", "ゾンビ系", ""],
    ["スライム系", "ボックススライム", "スライム系", "物質系", ""],
    ["スライム系", "スライム", "(なし)", "(なし)", ""],
    ["スライム系", "ホイミスライム", "スライム系", "マッドプラント", ""],
    ["スライム系", "スライムファング", "スライム系", "アルミラージ", ""],
    ["スライム系", "スライムファング", "スライム系", "キラーパンサー", ""],
    ["スライム系", "スライムファング", "スライム系", "パオーム", ""],
    ["スライム系", "スライムファング", "スライム系", "ストロングアニマル", ""],
    ["スライム系", "スライムファング", "スライム系", "ダークホーン", ""],
    ["スライム系", "スライムファング", "スライム系", "キングレオ", ""],
    ["スライム系", "ストーンスライム", "スライム系", "うごくせきぞう", ""],
    ["スライム系", "ストーンスライム", "スライム系", "ゴーレム", ""],
    ["スライム系", "ストーンスライム", "スライム系", "ばくだんいわ", ""],
    ["スライム系", "ストーンスライム", "スライム系", "しりょうのきし", ""],
    ["スライム系", "ストーンスライム", "スライム系", "ダンジョンえび", ""],
    ["スライム系", "スライムボーグ", "スライム系", "キラーマシン", ""],
    ["スライム系", "スラッピー", "スライム系", "スカルガルー", ""],
    ["スライム系", "ぶちキング", "ぶちスライム", "ぶちスライム", ""],
    ["スライム系", "キングスライム", "スライム", "スライム", "子が+5以上"],
    ["スライム系", "キングスライム", "スライム系", "????系", ""],
    ["スライム系", "メタルスライム", "スライム系", "メタルドラゴン", ""],
    ["スライム系", "はぐれメタル", "メタルスライム", "メタルスライム", ""],
    ["スライム系", "メタルキング", "はぐれメタル", "はぐれメタル", ""],
    ["スライム系", "メタルキング", "キングスライム", "メタルドラゴン", ""],
    ["スライム系", "メタルキング", "ぶちキング", "メタルドラゴン", ""],
    ["スライム系", "ゴールデンスライム", "メタルキング", "メタルキング", ""],
    [
      "スライム系",
      "ゴールデンスライム",
      "キングスライム",
      "ゴールデンゴーレム",
      "",
    ],
    [
      "スライム系",
      "ゴールデンスライム",
      "ぶちキング",
      "ゴールデンゴーレム",
      "",
    ],
    ["ドラゴン系", "ドラゴンキッズ", "ドラゴン系", "スライム系", ""],
    ["ドラゴン系", "ガメゴン", "ドラゴン系", "獣系", ""],
    ["ドラゴン系", "プテラノドン", "ドラゴン系", "鳥系", ""],
    ["ドラゴン系", "フーセンドラゴン", "ドラゴン系", "植物系", ""],
    ["ドラゴン系", "フェアリードラゴン", "ドラゴン系", "虫系", ""],
    ["ドラゴン系", "リザードマン", "ドラゴン系", "悪魔系", ""],
    ["ドラゴン系", "ポイズンリザード", "ドラゴン系", "ゾンビ系", ""],
    ["ドラゴン系", "ソードドラゴン", "ドラゴン系", "物質系", ""],
    [
      "ドラゴン系",
      "ドラゴン",
      "ドラゴンキッズ",
      "ドラゴンキッズ",
      "+4以上でグレイトドラゴン",
    ],
    ["ドラゴン系", "コドラ", "ドラゴン系", "ピッキー", ""],
    ["ドラゴン系", "ドラゴンマッド", "ドラゴン系", "ストロングアニマル", ""],
    ["ドラゴン系", "ドラゴンマッド", "フーセンドラゴン", "獣系", ""],
    ["ドラゴン系", "ライバーン", "ドラゴン系", "ヘルコンドル", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "アンクルホーン", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "ギガンテス", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "キラーパンサー", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "じごくのもんばん", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "じんめんじゅ", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "はねスライム", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "パオーム", ""],
    ["ドラゴン系", "ライバーン", "リザードマン", "ライオネック", ""],
    ["ドラゴン系", "おおイグアナ", "ドラゴン系", "ミステリドール", ""],
    ["ドラゴン系", "リザードフライ", "ドラゴン系", "キリキリバッタ", ""],
    ["ドラゴン系", "アンドレアル", "ドラゴン系", "ガップリン", ""],
    ["ドラゴン系", "キングコブラ", "ドラゴン系", "バブルスライム", ""],
    ["ドラゴン系", "デンタザウルス", "ドラゴン系", "ぐんたいガニ", ""],
    ["ドラゴン系", "デンタザウルス", "ドラゴン系", "ダンジョンえび", ""],
    ["ドラゴン系", "グレイトドラゴン", "ドラゴン", "ドラゴン", "子が+4以上"],
    [
      "ドラゴン系",
      "グレイトドラゴン",
      "ドラゴンキッズ",
      "ドラゴンキッズ",
      "子が+4以上",
    ],
    ["ドラゴン系", "とさかへび", "ドラゴン系", "おおにわとり", ""],
    ["ドラゴン系", "ウィングスネーク", "とさかへび", "とさかへび", ""],
    ["ドラゴン系", "コアトル", "ウィングスネーク", "ウィングスネーク", ""],
    ["ドラゴン系", "コアトル", "スカイドラゴン", "あくまのきし", ""],
    ["ドラゴン系", "コアトル", "バトルレックス", "うごくせきぞう", ""],
    ["ドラゴン系", "コアトル", "フーセンドラゴン", "ダークホーン", ""],
    ["ドラゴン系", "コアトル", "プテラノドン", "マネマネ", ""],
    ["ドラゴン系", "やまたのおろち", "ドラゴン系", "????系", ""],
    ["ドラゴン系", "やまたのおろち", "アンドレアル", "メドーサボール", ""],
    ["ドラゴン系", "やまたのおろち", "グレイトドラゴン", "メドーサボール", ""],
    ["ドラゴン系", "バトルレックス", "ドラゴン系", "あくまのきし", ""],
    ["ドラゴン系", "バトルレックス", "ドラゴン系", "キングレオ", ""],
    ["ドラゴン系", "バトルレックス", "ドラゴン系", "オーガー", ""],
    ["ドラゴン系", "バトルレックス", "ドラゴン系", "ライオネック", ""],
    ["ドラゴン系", "バトルレックス", "ドラゴン系", "デビルアーマー", ""],
    ["ドラゴン系", "スカイドラゴン", "ドラゴン系", "ひくいどり", ""],
    ["ドラゴン系", "しんりゅう", "スカイドラゴン", "やまたのおろち", ""],
    ["獣系", "ベロゴン", "獣系", "スライム系", ""],
    ["獣系", "アルミラージ", "獣系", "ドラゴン系", ""],
    ["獣系", "キャットフライ", "獣系", "鳥系", ""],
    ["獣系", "ファーラット", "獣系", "植物系", ""],
    ["獣系", "ミノーン", "獣系", "虫系", ""],
    ["獣系", "ストロングアニマル", "イエティ", "うごくせきぞう", ""],
    ["獣系", "ストロングアニマル", "グリズリー", "がいこつけんし", ""],
    ["獣系", "ストロングアニマル", "キラーエイプ", "ゴーレム", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "キラーマシン", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "ゴーレム", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "しにがみきぞく", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "スカルゴン", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "ダンジョンえび", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "ひょうがまじん", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "メタルドラゴン", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "ようがんまじん", ""],
    ["獣系", "ストロングアニマル", "ユニコーン", "ワイトキング", ""],
    ["獣系", "スカルガルー", "獣系", "ゾンビ系", ""],
    ["獣系", "かまいたち", "獣系", "物質系", ""],
    ["獣系", "アントベア", "獣系", "ミノーン", ""],
    ["獣系", "スーパーテンツク", "ストロングアニマル", "おどるほうせき", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "グレムリン", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "じんめんじゅ", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "スライムツリー", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "スライムファング", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "ドラゴンマッド", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "ファンキーバード", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "ベビーサタン", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "マッドプラント", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "マネマネ", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "ミミック", ""],
    ["獣系", "スーパーテンツク", "ベロゴン", "リップス", ""],
    ["獣系", "アイアンタートル", "獣系", "ガメゴン", ""],
    ["獣系", "ももんじゃ", "獣系", "ダックカイト", ""],
    ["獣系", "おおきづち", "獣系", "きりかぶおばけ", ""],
    ["獣系", "グリズリー", "獣系", "悪魔系", ""],
    ["獣系", "グリズリー", "獣系", "うごくせきぞう", ""],
    ["獣系", "グリズリー", "獣系", "ようがんまじん", ""],
    ["獣系", "グリズリー", "獣系", "ゴーレム", ""],
    ["獣系", "グリズリー", "獣系", "ひょうがまじん", ""],
    ["獣系", "グリズリー", "獣系", "メタルドラゴン", ""],
    ["獣系", "イエティ", "アイアンタートル", "スカイドラゴン", ""],
    ["獣系", "イエティ", "キラーエイプ", "ソードドラゴン", ""],
    ["獣系", "イエティ", "キラーパンサー", "ドラゴンマッド", ""],
    ["獣系", "イエティ", "ゴートドン", "バトルレックス", ""],
    ["獣系", "イエティ", "ゴートドン", "フーセンドラゴン", ""],
    ["獣系", "イエティ", "ゴートドン", "プテラノドン", ""],
    ["獣系", "キラースコップ", "獣系", "ひとくいサーベル", ""],
    ["獣系", "フェアリーラット", "獣系", "リザードフライ", ""],
    ["獣系", "ユニコーン", "獣系", "スライムファング", ""],
    ["獣系", "ユニコーン", "グリズリー", "スライム系", ""],
    ["獣系", "ユニコーン", "イエティ", "スライム系", ""],
    ["獣系", "ユニコーン", "キラーエイプ", "スライム系", ""],
    ["獣系", "ユニコーン", "ゴートドン", "スライム系", ""],
    ["獣系", "ユニコーン", "ストロングアニマル", "スライム系", ""],
    ["獣系", "ユニコーン", "パオーム", "スライム系", ""],
    ["獣系", "ユニコーン", "ベロゴン", "スライム系", ""],
    ["獣系", "ゴートドン", "獣系", "ドラゴスライム", ""],
    ["獣系", "ゴートドン", "獣系", "リザードマン", ""],
    ["獣系", "キラーエイプ", "アルミラージ", "ドラゴン系", ""],
    ["獣系", "キラーエイプ", "獣系", "デッドペッカー", ""],
    ["獣系", "パオーム", "キラーエイプ", "キラーエイプ", ""],
    ["獣系", "パオーム", "スーパーテンツク", "ドラゴン系", ""],
    ["獣系", "パオーム", "イエティ", "サンダーバード", ""],
    ["獣系", "パオーム", "グリズリー", "ヘルコンドル", ""],
    ["獣系", "パオーム", "ストロングアニマル", "モーザ", ""],
    ["獣系", "パオーム", "ベロゴン", "ロックちょう", ""],
    ["獣系", "キングレオ", "キラーマシン", "ユニコーン", ""],
    ["獣系", "キングレオ", "キラーマシン", "キラーパンサー", ""],
    ["獣系", "キングレオ", "キラーマシン", "スーパーテンツク", ""],
    ["獣系", "キングレオ", "キラーマシン", "ストロングアニマル", ""],
    ["獣系", "キングレオ", "キラーマシン", "ダークホーン", ""],
    ["獣系", "キングレオ", "キラーマシン", "パオーム", ""],
    ["獣系", "ダークホーン", "獣系", "????系", ""],
    ["獣系", "キラーパンサー", "獣系", "ドラゴン", ""],
    ["獣系", "ビックアイ", "獣系", "おおめだま", ""],
    ["鳥系", "ピッキー", "鳥系", "スライム系", ""],
    ["鳥系", "キメラ", "鳥系", "ドラゴン系", ""],
    ["鳥系", "あばれうしどり", "鳥系", "獣系", ""],
    ["鳥系", "はなカワセミ", "鳥系", "植物系", ""],
    ["鳥系", "ダックカイト", "鳥系", "虫系", ""],
    ["鳥系", "デッドペッカー", "鳥系", "悪魔系", ""],
    ["鳥系", "デスフラッター", "鳥系", "ゾンビ系", ""],
    ["鳥系", "ミストウイング", "鳥系", "物質系", ""],
    ["鳥系", "ドラキー", "ピッキー", "スライム系", ""],
    ["鳥系", "おおにわとり", "(なし)", "(なし)", ""],
    ["鳥系", "ガンコどり", "鳥系", "ストーンスライム", ""],
    ["鳥系", "モーザ", "あばれうしどり", "獣系", ""],
    ["鳥系", "キラーグース", "キメラ", "ドラゴン系", ""],
    ["鳥系", "キラーグース", "ひくいどり", "ドラゴン系", ""],
    ["鳥系", "キラーグース", "ヘルコンドル", "ドラゴン系", ""],
    ["鳥系", "キラーグース", "モーザ", "ドラゴン系", ""],
    ["鳥系", "キラーグース", "鳥系", "ドロル", ""],
    ["鳥系", "ヘルコンドル", "鳥系", "ネジまきどり", ""],
    ["鳥系", "ヘルコンドル", "モーザ", "悪魔系", ""],
    ["鳥系", "ホークブリザード", "鳥系", "イエティ", ""],
    ["鳥系", "ホークブリザード", "鳥系", "がいこつけんし", ""],
    ["鳥系", "ホークブリザード", "鳥系", "ゴートドン", ""],
    ["鳥系", "ホークブリザード", "鳥系", "しにがみきぞく", ""],
    ["鳥系", "ホークブリザード", "鳥系", "スーパーテンツク", ""],
    ["鳥系", "ホークブリザード", "鳥系", "スカルゴン", ""],
    ["鳥系", "ホークブリザード", "鳥系", "パオーム", ""],
    ["鳥系", "ホークブリザード", "鳥系", "はぐれメタル", ""],
    ["鳥系", "ホークブリザード", "鳥系", "ひょうがまじん", ""],
    ["鳥系", "ホークブリザード", "鳥系", "まおうのつかい", ""],
    ["鳥系", "ホークブリザード", "鳥系", "メタルスライム", ""],
    ["鳥系", "ホークブリザード", "鳥系", "ワイトキング", ""],
    ["鳥系", "ひくいどり", "鳥系", "アークデーモン", ""],
    ["鳥系", "ひくいどり", "鳥系", "アイアンタートル", ""],
    ["鳥系", "ひくいどり", "鳥系", "ギズモ", ""],
    ["鳥系", "ひくいどり", "鳥系", "グリズリー", ""],
    ["鳥系", "ひくいどり", "鳥系", "ストロングアニマル", ""],
    ["鳥系", "ひくいどり", "鳥系", "ドラゴスライム", ""],
    ["鳥系", "ひくいどり", "鳥系", "マネマネ", ""],
    ["鳥系", "ひくいどり", "鳥系", "ようがんまじん", ""],
    ["鳥系", "サンダーバード", "ひくいどり", "ギズモ", ""],
    ["鳥系", "サンダーバード", "ヘルコンドル", "ギズモ", ""],
    ["鳥系", "サンダーバード", "ロックちょう", "ギズモ", ""],
    ["鳥系", "サンダーバード", "鳥系", "????系", ""],
    ["鳥系", "ロックちょう", "鳥系", "ライバーン", ""],
    ["鳥系", "ロックちょう", "キラーグース", "うごくせきぞう", ""],
    ["鳥系", "ロックちょう", "サンダーバード", "ゴーレム", ""],
    ["鳥系", "ロックちょう", "ヘルコンドル", "ストーンスライム", ""],
    ["鳥系", "ロックちょう", "ホークブリザード", "スライムボーグ", ""],
    ["鳥系", "ロックちょう", "モーザ", "ダンジョンえび", ""],
    ["鳥系", "ロックちょう", "モーザ", "メタルドラゴン", ""],
    ["鳥系", "ファンキーバード", "鳥系", "ダンスキャロット", ""],
    ["鳥系", "にじくじゃく", "ホークブリザード", "ひくいどり", ""],
    ["植物系", "マッドプラント", "植物系", "スライム系", ""],
    ["植物系", "かりゅうそう", "植物系", "ドラゴン系", ""],
    ["植物系", "はなまどう", "植物系", "獣系", ""],
    ["植物系", "ふゆうじゅ", "植物系", "鳥系", ""],
    ["植物系", "サボテンボール", "植物系", "虫系", ""],
    ["植物系", "ガップリン", "植物系", "悪魔系", ""],
    ["植物系", "マダンゴ", "植物系", "ゾンビ系", ""],
    ["植物系", "コハクそう", "植物系", "物質系", ""],
    ["植物系", "きりかぶおばけ", "コハクそう", "獣系", ""],
    ["植物系", "オニオーン", "植物系", "せみもぐら", ""],
    ["植物系", "ダンスキャロット", "マッドプラント", "獣系", ""],
    ["植物系", "ダンスキャロット", "植物系", "トーテムキラー", ""],
    ["植物系", "ヘルボックル", "植物系", "ピクシー", ""],
    ["植物系", "じんめんじゅ", "植物系", "ナイトウィプス", ""],
    ["植物系", "じんめんじゅ", "じんめんじゅ", "ドラゴン系", ""],
    ["植物系", "マンドラゴラ", "ダンスキャロット", "悪魔系", ""],
    ["植物系", "マンドラゴラ", "植物系", "ファンキーバード", ""],
    ["植物系", "ビーンファイター", "植物系", "ファーラット", ""],
    ["植物系", "エビルシード", "植物系", "あくまのカガミ", ""],
    ["植物系", "エビルシード", "植物系", "おおめだま", ""],
    ["植物系", "エビルシード", "植物系", "じんめんちょう", ""],
    ["植物系", "エビルシード", "植物系", "ストーンスライム", ""],
    ["植物系", "エビルシード", "植物系", "ダークアイ", ""],
    ["植物系", "エビルシード", "植物系", "ダックカイト", ""],
    ["植物系", "エビルシード", "植物系", "ビックアイ", ""],
    ["植物系", "エビルシード", "植物系", "メーダ", ""],
    ["植物系", "マンイーター", "エビルシード", "エビルシード", ""],
    ["植物系", "ひとくいそう", "マンイーター", "マンイーター", ""],
    ["植物系", "ローズバトラー", "植物系", "????系", ""],
    ["植物系", "わたぼう", "(なし)", "(なし)", ""],
    ["虫系", "おおなめくじ", "虫系", "スライム系", ""],
    ["虫系", "キャタピラー", "虫系", "ドラゴン系", ""],
    ["虫系", "せみもぐら", "虫系", "獣系", ""],
    ["虫系", "じんめんちょう", "虫系", "鳥系", ""],
    ["虫系", "とうちゅうかそう", "虫系", "植物系", ""],
    ["虫系", "おおみみず", "虫系", "悪魔系", ""],
    ["虫系", "リップス", "虫系", "ゾンビ系", ""],
    ["虫系", "はさみくわがた", "虫系", "物質系", ""],
    ["虫系", "ぐんたいアリ", "おおなめくじ", "スライム系", ""],
    ["虫系", "キリキリバッタ", "(なし)", "(なし)", ""],
    ["虫系", "テールイーター", "とうちゅうかそう", "植物系", ""],
    ["虫系", "よろいムカデ", "虫系", "アイアンタートル", ""],
    ["虫系", "よろいムカデ", "ドロル", "ドラゴン系", ""],
    ["虫系", "よろいムカデ", "おおみみず", "物質系", ""],
    ["虫系", "メーダ", "キャタピラー", "獣系", ""],
    ["虫系", "メーダ", "ドロル", "ドラゴン系", ""],
    ["虫系", "メーダ", "おおみみず", "物質系", ""],
    ["虫系", "デスファレーナ", "じんめんちょう", "悪魔系", ""],
    ["虫系", "デスファレーナ", "虫系", "ミノーン", ""],
    ["虫系", "ドロル", "じんめんちょう", "じんめんちょう", ""],
    ["虫系", "ドロル", "テールイーター", "テールイーター", ""],
    ["虫系", "ドロル", "メーダ", "メーダ", ""],
    ["虫系", "ドロル", "虫系", "ゴースト", ""],
    ["虫系", "ぐんたいガニ", "虫系", "ダーククラブ", ""],
    ["虫系", "ヘルホーネット", "虫系", "フェアリーラット", ""],
    ["虫系", "ヘルホーネット", "ドロル", "ゾンビ系", ""],
    ["虫系", "ヘルホーネット", "メーダ", "ゾンビ系", ""],
    ["虫系", "ホーンビートル", "はさみくわがた", "はさみくわがた", ""],
    ["虫系", "ホーンビートル", "よろいムカデ", "悪魔系", ""],
    ["虫系", "さそりアーマー", "ホーンビートル", "ホーンビートル", ""],
    ["虫系", "ダンジョンえび", "虫系", "????系", ""],
    ["悪魔系", "ピクシー", "悪魔系", "スライム系", ""],
    ["悪魔系", "アークデーモン", "悪魔系", "????系", ""],
    ["悪魔系", "アークデーモン", "オーガー", "ドラゴン系", ""],
    ["悪魔系", "アークデーモン", "じごくのもんばん", "ゾンビ系", ""],
    ["悪魔系", "アークデーモン", "ギガンテス", "アンドレアル", ""],
    ["悪魔系", "アークデーモン", "グレンデル", "うごくせきぞう", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "キングスライム", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "キングレオ", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "グレイトドラゴン", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "サンダーバード", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "パオーム", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "ぶちキング", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "メタルドラゴン", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "メタルキング", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "やまたのおろち", ""],
    ["悪魔系", "アークデーモン", "シルバーデビル", "ロックちょう", ""],
    ["悪魔系", "シルバーデビル", "グレムリン", "ドラゴン系", ""],
    ["悪魔系", "シルバーデビル", "スカルライダー", "ドラゴン系", ""],
    ["悪魔系", "シルバーデビル", "ヘルビースト", "ドラゴン系", ""],
    ["悪魔系", "シルバーデビル", "メドーサボール", "ドラゴン系", ""],
    ["悪魔系", "ベビーサタン", "悪魔系", "鳥系", ""],
    ["悪魔系", "ダークアイ", "悪魔系", "植物系", ""],
    ["悪魔系", "おおめだま", "悪魔系", "虫系", ""],
    ["悪魔系", "スカルライダー", "悪魔系", "ゾンビ系", ""],
    ["悪魔系", "ヘルビースト", "悪魔系", "物質系", ""],
    ["悪魔系", "ひとつめピエロ", "おおめだま", "スライム系", ""],
    ["悪魔系", "ひとつめピエロ", "ピクシー", "スライム系", ""],
    ["悪魔系", "ひとつめピエロ", "ベビーサタン", "スライム系", ""],
    ["悪魔系", "グレムリン", "悪魔系", "獣系", ""],
    ["悪魔系", "メドーサボール", "悪魔系", "ドラゴン系", ""],
    ["悪魔系", "ライオネック", "悪魔系", "リザードマン", ""],
    ["悪魔系", "ライオネック", "アークデーモン", "ゾンビ系", ""],
    ["悪魔系", "アンクルホーン", "アークデーモン", "獣系", ""],
    ["悪魔系", "アンクルホーン", "悪魔系", "ダークホーン", ""],
    ["悪魔系", "オーク", "悪魔系", "ビーンファイター", ""],
    ["悪魔系", "オーガー", "悪魔系", "おおきづち", ""],
    ["悪魔系", "オーガー", "じごくのもんばん", "ドラゴン系", ""],
    ["悪魔系", "じごくのもんばん", "ベビーサタン", "ベビーサタン", ""],
    ["悪魔系", "じごくのもんばん", "オーガー", "ゾンビ系", ""],
    ["悪魔系", "きりさきピエロ", "ひとつめピエロ", "ひとつめピエロ", ""],
    ["悪魔系", "グレンデル", "悪魔系", "ドラゴンマッド", ""],
    ["悪魔系", "グレンデル", "グレムリン", "獣系", ""],
    ["悪魔系", "グレンデル", "スカルライダー", "獣系", ""],
    ["悪魔系", "グレンデル", "ヘルビースト", "獣系", ""],
    ["悪魔系", "グレンデル", "メドーサボール", "獣系", ""],
    ["悪魔系", "アクバー", "アークデーモン", "じごくのもんばん", ""],
    ["悪魔系", "アクバー", "グレンデル", "グレンデル", ""],
    ["悪魔系", "あくまのきし", "悪魔系", "さまようよろい", ""],
    ["悪魔系", "ギガンデス", "スカルライダー", "ゾンビ系", ""],
    ["悪魔系", "ギガンデス", "ヘルビースト", "ゾンビ系", ""],
    ["悪魔系", "ギガンデス", "メドーサボール", "ゾンビ系", ""],
    ["悪魔系", "ギガンデス", "悪魔系", "ビッグアイ", ""],
    ["悪魔系", "ずしおうまる", "アークデーモン", "ドラゴン系", ""],
    ["悪魔系", "ずしおうまる", "オーガー", "獣系", ""],
    ["悪魔系", "ずしおうまる", "じごくのもんばん", "獣系", ""],
    ["悪魔系", "デビルアーマー", "悪魔系", "よろいムカデ", ""],
    ["悪魔系", "デビルアーマー", "アークデーモン", "物質系", ""],
    ["悪魔系", "デビルアーマー", "オーガー", "物質系", ""],
    ["悪魔系", "デビルアーマー", "じごくのもんばん", "物質系", ""],
    ["悪魔系", "ジャミラス", "アクバー", "にじくじゃく", ""],
    ["悪魔系", "ジャミラス", "にじくじゃく", "アクバー", ""],
    ["悪魔系", "デュラン", "ずしおうまる", "ゴールデンゴーレム", ""],
    ["悪魔系", "デュラン", "ゴールデンゴーレム", "ずしおうまる", ""],
    ["ゾンビ系", "ゴースト", "ゾンビ系", "スライム系", ""],
    ["ゾンビ系", "スカルゴン", "ゾンビ系", "アンドレアル", ""],
    ["ゾンビ系", "スカルゴン", "ゾンビ系", "グレイトドラゴン", ""],
    ["ゾンビ系", "スカルゴン", "ゾンビ系", "しんりゅう", ""],
    ["ゾンビ系", "スカルゴン", "ゾンビ系", "ソードドラゴン", ""],
    ["ゾンビ系", "スカルゴン", "ゾンビ系", "バトルレックス", ""],
    ["ゾンビ系", "スカルゴン", "ゾンビ系", "やまたのおろち", ""],
    ["ゾンビ系", "アニマルゾンビ", "ゾンビ系", "獣系", ""],
    ["ゾンビ系", "やたがらす", "ゾンビ系", "鳥系", ""],
    ["ゾンビ系", "マミー", "ゾンビ系", "植物系", ""],
    ["ゾンビ系", "ダーククラブ", "ゾンビ系", "虫系", ""],
    ["ゾンビ系", "しりょうのきし", "ゾンビ系", "悪魔系", ""],
    ["ゾンビ系", "シャドー", "ゾンビ系", "物質系", ""],
    ["ゾンビ系", "くさったしたい", "ゴースト", "獣系", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "イエティ", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "おおなめくじ", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "スライムファング", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "ダンスキャロット", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "ドロル", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "ファンキーバード", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "ベロゴン", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "ボックススライム", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "マッドプラント", ""],
    ["ゾンビ系", "マッドロン", "ゾンビ系", "リップス", ""],
    ["ゾンビ系", "ナイトウイプス", "ゾンビ系", "ミストウィング", ""],
    ["ゾンビ系", "エビルスピリッツ", "ゾンビ系", "ドラゴン系", ""],
    ["ゾンビ系", "ウインドマージ", "ゾンビ系", "かまいたち", ""],
    ["ゾンビ系", "ウインドマージ", "やたがらす", "鳥系", ""],
    ["ゾンビ系", "しにがみ", "ゾンビ系", "とうちゅうかそう", ""],
    ["ゾンビ系", "しにがみ", "くさったしたい", "悪魔系", ""],
    ["ゾンビ系", "しにがみ", "ゴースト", ""],
    ["ゾンビ系", "しにがみきぞく", "しりょうのきし", "しりょうのきし", ""],
    ["ゾンビ系", "しにがみきぞく", "しりょうのきし", "マネマネ", ""],
    ["ゾンビ系", "しにがみきぞく", "スカルゴン", ""],
    ["ゾンビ系", "しにがみきぞく", "エビルスピリッツ", "アークデーモン", ""],
    ["ゾンビ系", "しにがみきぞく", "エビルスピリッツ", "キラーマシン", ""],
    ["ゾンビ系", "しにがみきぞく", "エビルスピリッツ", "じごくのもんばん", ""],
    ["ゾンビ系", "しにがみきぞく", "エビルスピリッツ", "メタルドラゴン", ""],
    ["ゾンビ系", "しにがみきぞく", "エビルスピリッツ", "ライオネック", ""],
    ["ゾンビ系", "しにがみきぞく", "がいこつけんし", "アークデーモン", ""],
    ["ゾンビ系", "しにがみきぞく", "ボーンプリズナー", "キラーマシン", ""],
    ["ゾンビ系", "しにがみきぞく", "マッドロン", "じごくのもんばん", ""],
    ["ゾンビ系", "しにがみきぞく", "マッドロン", "マネマネ", ""],
    ["ゾンビ系", "しにがみきぞく", "マッドロン", "メタルドラゴン", ""],
    ["ゾンビ系", "しにがみきぞく", "マッドロン", "ライオネック", ""],
    ["ゾンビ系", "ワイトキング", "ゾンビ系", "????系", ""],
    ["ゾンビ系", "ワイトキング", "がいこつけんし", "アンドレアル", ""],
    ["ゾンビ系", "ワイトキング", "しにがみきぞく", "キングスライム", ""],
    ["ゾンビ系", "ワイトキング", "スカルゴン", "キングレオ", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "グレイトドラゴン", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "ゴールデンゴーレム", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "サンダーバード", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "ぶちキング", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "ホークブリザード", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "メタルキング", ""],
    ["ゾンビ系", "ワイトキング", "ボーンプリズナー", "ロックちょう", ""],
    ["ゾンビ系", "ボーンプリズナー", "くさったしたい", "くさったしたい", ""],
    ["ゾンビ系", "ボーンプリズナー", "くさったしたい", "キラーグース", ""],
    ["ゾンビ系", "ボーンプリズナー", "しりょうのきし", "グレムリン", ""],
    ["ゾンビ系", "ボーンプリズナー", "マミー", "ストーンスライム", ""],
    ["ゾンビ系", "ボーンプリズナー", "マミー", "スライムボーグ", ""],
    ["ゾンビ系", "ボーンプリズナー", "マミー", "はなまどう", ""],
    ["ゾンビ系", "ボーンプリズナー", "マミー", "ホーンビートル", ""],
    ["ゾンビ系", "ボーンプリズナー", "マミー", "モーザ", ""],
    ["ゾンビ系", "がいこつけんし", "ボーンプリズナー", "ボーンプリズナー", ""],
    ["ゾンビ系", "がいこつけんし", "エビルスピリッツ", "うごくせきぞう", ""],
    ["ゾンビ系", "がいこつけんし", "くさったしたい", "オーガー", ""],
    ["ゾンビ系", "がいこつけんし", "しりょうのきし", "キラーパンサー", ""],
    ["ゾンビ系", "がいこつけんし", "マッドロン", "グリズリー", ""],
    ["ゾンビ系", "がいこつけんし", "マミー", "ゴーレム", ""],
    ["ゾンビ系", "がいこつけんし", "マミー", "ストロングアニマル", ""],
    ["ゾンビ系", "がいこつけんし", "マミー", "デスファレーナ", ""],
    ["ゾンビ系", "がいこつけんし", "マミー", "ヘルコンドル", ""],
    ["ゾンビ系", "がいこつけんし", "マミー", "ヘルビースト", ""],
    ["ゾンビ系", "まおうのつかい", "がいこつけんし", "がいこつけんし", ""],
    ["ゾンビ系", "まおうのつかい", "ワイトキング", "悪魔系", ""],
    ["ゾンビ系", "マネマネ", "(なし)", "(なし)", ""],
    ["物質系", "おどるほうせき", "物質系", "スライム系", ""],
    ["物質系", "エビルワンド", "物質系", "ドラゴン系", ""],
    ["物質系", "おばけキャンドル", "物質系", "獣系", ""],
    ["物質系", "ネジまきどり", "物質系", "鳥系", ""],
    ["物質系", "トーテムキラー", "物質系", "植物系", ""],
    ["物質系", "とげぼうず", "物質系", "虫系", ""],
    ["物質系", "あくまのカガミ", "物質系", "悪魔系", ""],
    ["物質系", "さまようよろい", "物質系", "ゾンビ系", ""],
    ["物質系", "マドハンド", "(なし)", "(なし)", ""],
    ["物質系", "ミステリドール", "物質系", "リップス", ""],
    ["物質系", "ミステリドール", "うごくせきぞう", "ストーンスライム", ""],
    ["物質系", "ミステリドール", "ゴーレム", "スライムつむり", ""],
    ["物質系", "ミステリドール", "ゴーレム", "スライムナイト", ""],
    ["物質系", "ミステリドール", "ゴーレム", "ドラゴスライム", ""],
    ["物質系", "メタルドラゴン", "物質系", "アンドレアル", ""],
    ["物質系", "メタルドラゴン", "アンドレアル", "うごくせきぞう", ""],
    ["物質系", "メタルドラゴン", "グレイトドラゴン", "キラーマシン", ""],
    ["物質系", "メタルドラゴン", "デンタザウルス", "キングスライム", ""],
    ["物質系", "メタルドラゴン", "デンタザウルス", "ゴーレム", ""],
    ["物質系", "メタルドラゴン", "デンタザウルス", "スカルゴン", ""],
    ["物質系", "メタルドラゴン", "デンタザウルス", "スライムボーグ", ""],
    ["物質系", "メタルドラゴン", "デンタザウルス", "ダンジョンえび", ""],
    ["物質系", "メタルドラゴン", "キラーマシン", "ドラゴン系", ""],
    ["物質系", "メタルドラゴン", "メタルドラゴン", "ドラゴン系", ""],
    ["物質系", "バルザック", "物質系", "????系", ""],
    ["物質系", "バルザック", "ひょうがまじん", "悪魔系", ""],
    ["物質系", "バルザック", "ようがんまじん", "悪魔系", ""],
    ["物質系", "ひとくいサーベル", "物質系", "おおみみず", ""],
    ["物質系", "ひとくいサーベル", "うごくせきぞう", "キラーグース", ""],
    ["物質系", "ひとくいサーベル", "エビルワンド", "ひくいどり", ""],
    ["物質系", "ひとくいサーベル", "ゴーレム", "ファンキーバード", ""],
    ["物質系", "ひとくいサーベル", "ミステリードール", "モーザ", ""],
    ["物質系", "のろいのランプ", "キラーマシン", "鳥系", ""],
    ["物質系", "のろいのランプ", "物質系", "ふゆうじゅ", ""],
    ["物質系", "キラーマシン", "物質系", "キングレオ", ""],
    ["物質系", "キラーマシン", "物質系", "キラーマシン", ""],
    ["物質系", "キラーマシン", "物質系", "グリズリー", ""],
    ["物質系", "キラーマシン", "物質系", "スカルライダー", ""],
    ["物質系", "キラーマシン", "物質系", "ストロングアニマル", ""],
    ["物質系", "キラーマシン", "物質系", "パオーム", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "オーガー", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "がいこつけんし", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "グレイトドラゴン", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "グレンデル", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "しにがみきぞく", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "デビルアーマー", ""],
    ["物質系", "キラーマシン", "ひとくいサーベル", "ユニコーン", ""],
    ["物質系", "あくまのつぼ", "物質系", "スライムつむり", ""],
    ["物質系", "あくまのつぼ", "ギズモ", "悪魔系", ""],
    ["物質系", "ギズモ", "あくまのカガミ", "エビルシード", ""],
    ["物質系", "ギズモ", "おばけキャンドル", "かりゅうそう", ""],
    ["物質系", "ギズモ", "マドハンド", "キメラ", ""],
    ["物質系", "ギズモ", "マドハンド", "ドラゴスライム", ""],
    ["物質系", "ギズモ", "マドハンド", "ひくいどり", ""],
    ["物質系", "ギズモ", "マドハンド", "ミストウィング", ""],
    ["物質系", "ようがんまじん", "メタルドラゴン", "アークデーモン", ""],
    ["物質系", "ようがんまじん", "メタルドラゴン", "キングレオ", ""],
    ["物質系", "ようがんまじん", "メタルドラゴン", "サンダーバード", ""],
    ["物質系", "ようがんまじん", "メタルドラゴン", "ずしおうまる", ""],
    ["物質系", "ようがんまじん", "メタルドラゴン", "やまたのおろち", ""],
    ["物質系", "ひょうがまじん", "メタルドラゴン", "スカルゴン", ""],
    ["物質系", "ひょうがまじん", "メタルドラゴン", "ワイトキング", ""],
    ["物質系", "ひょうがまじん", "キラーマシン", "キングレオ", ""],
    ["物質系", "ミミック", "物質系", "ボックススライム", ""],
    ["物質系", "ミミック", "キラーマシン", "ゾンビ系", ""],
    ["物質系", "どろにんぎょう", "マドハンド", "マドハンド", ""],
    ["物質系", "ゴーレム", "どろにんぎょう", "どろにんぎょう", ""],
    ["物質系", "うごくせきぞう", "ゴーレム", "ゴーレム", ""],
    ["物質系", "うごくせきぞう", "物質系", "ダンジョンえび", ""],
    ["物質系", "うごくせきぞう", "物質系", "ホーンビートル", ""],
    ["物質系", "ばくだんいわ", "とげぼうず", "とげぼうず", ""],
    ["物質系", "ばくだんいわ", "キラーマシン", "虫系", ""],
    ["物質系", "ゴールデンゴーレム", "ひょうがまじん", "ようがんまじん", ""],
    ["????系", "りゅうおう", "まおうのつかい", "アンドレアル", ""],
    ["????系", "りゅうおう", "まおうのつかい", "グレイトドラゴン", ""],
    ["????系", "りゅうおう(DRAGON)", "りゅうおう", "しんりゅう", ""],
    ["????系", "ハーゴン", "ワイトキング", "メタルキング", ""],
    ["????系", "シドー", "ジャミラス", "ローズバトラー", ""],
    ["????系", "バラモス", "ハーゴン", "やまたのおろち", ""],
    ["????系", "ゾーマ", "りゅうおう", "シドー", ""],
    ["????系", "ゾーマ", "りゅうおう(DRAGON)", "シドー", ""],
    ["????系", "デスピサロ", "デュラン", "しんりゅう", ""],
    ["????系", "エスターク", "デスピサロ", "キングレオ", ""],
    ["????系", "ミルドラース", "エスターク", "ゴールデンスライム", ""],
    ["????系", "ミルドラース(変身)", "ミルドラース", "デンタザウルス", ""],
    ["????系", "ムドー", "バラモス", "ダークホーン", ""],
    ["????系", "デスタムーア", "ゾーマ", "ミルドラース", ""],
    ["????系", "デスタムーア", "ゾーマ", "ミルドラース(変身)", ""],
    ["????系", "デスタムーア", "ミルドラース", "ゾーマ", ""],
    ["????系", "デスタムーア", "ミルドラース(変身)", "ゾーマ", ""],
    ["????系", "デスタムーア(変身)", "デスタムーア", "さそりアーマー", ""],
    ["????系", "デスタムーア(最終)", "デスタムーア(変身)", "ムドー", ""],
    ["????系", "ダークドレアム", "デスタムーア(最終)", "わたぼう", ""],
  ];

  updateTable(data); // 初期データ表示
});
