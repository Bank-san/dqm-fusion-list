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
        <td>${row[0] || ""}</td>
        <td>${row[1] || ""}</td>
        <td>${row[2] || ""}</td>
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
      <th>旅の扉</th>
      <th>モンスター</th>
      <th>階層</th>
      <th class="note-column">備考</th>
    </tr>
  `;
  document.querySelector("thead").innerHTML = tableHeader;

  const data = [
    ["たびだち", "スライム", "1-4"],
    ["たびだち", "ドラキー", "1-4"],
    ["たびだち", "アントベア", "1-4"],
    ["まちびと", "きりかぶおばけ", "1-4"],
    ["まちびと", "キリキリバッタ", "1-4"],
    ["まちびと", "アントベア", "1-2"],
    ["まちびと", "ピッキー", "1-2"],
    ["まちびと", "グレムリン", "3-4"],
    ["まちびと", "ファーラット", "3-4"],
    ["まもり", "ゴースト", "1-5"],
    ["まもり", "ぐんたいアリ", "1-5"],
    ["まもり", "アントベア", "1-2"],
    ["まもり", "コドラ", "1-2"],
    ["まもり", "マドハンド", "3-5"],
    ["まもり", "ピッキー", "3-5"],
    ["おもいで", "キャタピラー", "1-4"],
    ["おもいで", "マドハンド", "1-2"],
    ["おもいで", "ファーラット", "1-2"],
    ["おもいで", "ドラゴンキッズ", "1-2"],
    ["おもいで", "ピッキー", "3-4"],
    ["おもいで", "フェアリーラット", "3-4"],
    ["おもいで", "ぶちスライム", "3-4"],
    ["とまどい", "ぶちスライム", "1-5"],
    ["とまどい", "コドラ", "1-2"],
    ["とまどい", "おおにわとり", "1-2"],
    ["とまどい", "ドラゴンキッズ", "1-2"],
    ["とまどい", "エビルシード", "3-5"],
    ["とまどい", "ベビーサタン", "3-5"],
    ["とまどい", "くさったしたい", "3-5"],
    ["バザー(炎)", "おおにわとり", "1-5"],
    ["バザー(炎)", "フェアリーラット", "1-2"],
    ["バザー(炎)", "ぶちスライム", "1-2"],
    ["バザー(炎)", "とさかへび", "1-2"],
    ["バザー(炎)", "キャラピラー", "3-8"],
    ["バザー(炎)", "ドラゴンキッズ", "3-5"],
    ["バザー(炎)", "ビーンファイター", "3-5"],
    ["バザー(炎)", "ベビーサタン", "6-8"],
    ["バザー(炎)", "くさったしたい", "6-8"],
    ["バザー(炎)", "ひとつめピエロ", "6-8"],
    ["やすらぎ", "とさかへび", "1-7"],
    ["やすらぎ", "おおにわとり", "1-3"],
    ["やすらぎ", "ぶちスライム", "1-3"],
    ["やすらぎ", "ネジまきどり", "1-3"],
    ["やすらぎ", "アルミラージ", "4-7"],
    ["やすらぎ", "ドラゴンキッズ", "4-5"],
    ["やすらぎ", "ボーンプリズナー", "4-5"],
    ["やすらぎ", "ひとくいサーベル", "6-7"],
    ["やすらぎ", "あばれうしどり", "6-7"],
    ["ゆうき", "ビーンファイター", "1-8"],
    ["ゆうき", "はなまどう", "1-8"],
    ["ゆうき", "ベビーサタン", "1-3"],
    ["ゆうき", "ひとつめピエロ", "1-3"],
    ["ゆうき", "おおみみず", "4-8"],
    ["ゆうき", "あばれうしどり", "6-8"],
    ["井戸", "はなまどう", "1-11"],
    ["井戸", "おおなめくじ", "1-5"],
    ["井戸", "アルミラージ", "1-5"],
    ["井戸", "ボーンプリズナー", "1-3"],
    ["井戸", "スライムツリー", "4-5"],
    ["井戸", "おおみみず", "6-8"],
    ["井戸", "あばれうしどり", "9-11"],
    ["井戸", "ひとくいサーベル", "9-11"],
    ["井戸", "メタルスライム", "9-11"],
    ["いかり", "キャットフライ", "1-10"],
    ["いかり", "ポイズンリザード", "1-8"],
    ["いかり", "おおなめくじ", "1-5"],
    ["いかり", "おおみみず", "1-3"],
    ["いかり", "メーダ", "4-10"],
    ["いかり", "アニマルゾンビ", "6-10"],
    ["いかり", "ドラゴスライム", "9-10"],
    ["ちから", "スライムツリー", "1-3,6-10"],
    ["ちから", "フェアリードラゴン", "1-5,8-10"],
    ["ちから", "スカルライダー", "1-8"],
    ["ちから", "どろにんぎょう", "1-5"],
    ["ちから", "ふゆうじゅ", "4-10"],
    ["ちから", "ドラゴスライム", "6-10"],
    ["牧場右上", "スカルガルー", "1-11"],
    ["牧場右上", "デスフラッター", "1-8"],
    ["牧場右上", "フェアリードラゴン", "1-5"],
    ["牧場右上", "じんめんちょう", "1-3"],
    ["牧場右上", "マッドロン", "4-5,9-11"],
    ["牧場右上", "ドラゴスライム", "6-11"],
    ["牧場右上", "トーテムキラー", "6-11"],
    ["よろこび", "デッドペッカー", "1-8"],
    ["よろこび", "ミノーン", "1-12"],
    ["よろこび", "ガップリン", "1-8"],
    ["よろこび", "スライムつむり", "1-5"],
    ["よろこび", "おおめだま", "6-13"],
    ["よろこび", "バブルスライム", "9-13"],
    ["よろこび", "マミー", "9-13"],
    ["ちえ", "ベロゴン", "1-14"],
    ["ちえ", "はなカワセミ", "1-14"],
    ["ちえ", "プテラノドン", "1-14"],
    ["ちえ", "トーテムキラー", "1-5"],
    ["ちえ", "よろいムカデ", "6-14"],
    ["格闘場(左)", "キラースコップ", "1-15"],
    ["格闘場(左)", "おばけキャンドル", "1-12"],
    ["格闘場(左)", "メドーサボール", "1-8"],
    ["格闘場(左)", "はねスライム", "1-5"],
    ["格闘場(左)", "スラッピー", "6-15"],
    ["格闘場(左)", "かまいたち", "9-15"],
    ["格闘場(左)", "フーセンドラゴン", "13-15"],
    ["しあわせ", "せみもぐら", "1-17"],
    ["しあわせ", "ピクシー", "1-16"],
    ["しあわせ", "オニオーン", "1-12"],
    ["しあわせ", "フーセンドラゴン", "1-4"],
    ["しあわせ", "しりょうのきし", "5-17"],
    ["しあわせ", "ガンコどり", "13-17"],
    ["しあわせ", "とげぼうず", "17"],
    ["さそい", "スライムナイト", "1-19"],
    ["さそい", "キングコブラ", "1-16"],
    ["さそい", "ももんじゃ", "1-12"],
    ["さそい", "とげぼうず", "1-8"],
    ["さそい", "はさみくわがた", "9-19"],
    ["さそい", "ミストウィング", "13-19"],
    ["さそい", "ダークアイ", "17-19"],
    ["メダルおじさん", "ボックススライム", "1-18"],
    ["メダルおじさん", "オーク", "1-18"],
    ["メダルおじさん", "ギズモ", "1-8"],
    ["メダルおじさん", "ナイトウィプス", "1-5"],
    ["メダルおじさん", "さまようよろい", "6-18"],
    ["メダルおじさん", "しにがみ", "9-18"],
    ["まよい", "ストーンスライム", "1-22"],
    ["まよい", "ギズモ", "1-22"],
    ["まよい", "サボテンボール", "1-20"],
    ["まよい", "テールイーター", "1-10,16-20"],
    ["まよい", "おおイグアナ", "1-5"],
    ["まよい", "ダックカイト", "6-22"],
    ["まよい", "シルバーデビル", "11-22"],
    ["まよい", "ウィンドマージ", "21-22"],
    ["さばき", "キラーグース", "1-10,21-24"],
    ["さばき", "おおきづち", "1-24"],
    ["さばき", "ぶちキング", "1-24"],
    ["さばき", "ヘルボックル", "1-20"],
    ["さばき", "デスファレーナ", "1-17"],
    ["さばき", "とうちゅうかそう", "1-5"],
    ["さばき", "リザードフライ", "11-24"],
    ["さばき", "ドロル", "16-24"],
    ["図書館", "エビルスピリッツ", "1-10,16-24"],
    ["図書館", "アークデーモン", "1-24"],
    ["図書館", "ぐんたいガニ", "1-20"],
    ["図書館", "コハクそう", "1-5"],
    ["図書館", "キラーイエプ", "6-20"],
    ["図書館", "のろいのランプ", "11-24"],
    ["図書館", "ガメゴン", "11-24"],
    ["図書館", "モーザ", "21-24"],
    ["かがみ", "リザードマン", "1-20"],
    ["かがみ", "スライムボーグ", "1-15"],
    ["かがみ", "ヘルビースト", "1-10"],
    ["かがみ", "シャドー", "1-10"],
    ["かがみ", "エビルワンド", "1-5"],
    ["かがみ", "グリズリー", "6-28"],
    ["かがみ", "キメラ", "11-25"],
    ["かがみ", "かりゅうそう", "11-15"],
    ["かがみ", "ヘルホーネット", "16-28"],
    ["かがみ", "ライオネック", "16-28"],
    ["かがみ", "やたがらす", "21-28"],
    ["かがみ", "おどるほうせき", "26-28"],
    ["やぼう", "キリキリバッタ", "1-5"],
    ["やぼう", "ぐんたいアリ", "1-5"],
    ["やぼう", "キャタピラー", "1-5"],
    ["やぼう", "おおみみず", "1-5"],
    ["やぼう", "おおなめくじ", "6-10"],
    ["やぼう", "メーダ", "6-10"],
    ["やぼう", "じんめんちょう", "6-10"],
    ["やぼう", "よろいムカデ", "6-10"],
    ["やぼう", "せみもぐら", "11-20"],
    ["やぼう", "はさみくわがた", "11-20"],
    ["やぼう", "テールイーター", "11-20"],
    ["やぼう", "とうちゅうかそう", "11-20"],
    ["やぼう", "ドロル", "21-29"],
    ["やぼう", "デスファレーナ", "21-29"],
    ["やぼう", "ぐんたいガニ", "21-29"],
    ["やぼう", "ヘルホーネット", "21-29"],
    ["はかい", "きりかぶおばけ", "1-5"],
    ["はかい", "エビルシード", "1-5"],
    ["はかい", "ビーンファイター", "1-5"],
    ["はかい", "はなまどう", "1-5"],
    ["はかい", "ふゆうじゅ", "6-10"],
    ["はかい", "ガップリン", "6-10"],
    ["はかい", "マッドプラント", "6-10"],
    ["はかい", "オニオーン", "6-10"],
    ["はかい", "かりゅうそう", "11-28"],
    ["はかい", "サボテンボール", "11-28"],
    ["はかい", "ヘルボックル", "11-28"],
    ["はかい", "コハクそう", "11-28"],
    ["はかい", "マンイーター", "21-28"],
    ["はかい", "ダンスキャロット", "21-28"],
    ["はかい", "ひとくいそう", "21-28"],
    ["あやつり", "ドラキー", "1-5"],
    ["あやつり", "ピッキー", "1-5"],
    ["あやつり", "おおにわとり", "1-5"],
    ["あやつり", "あばれうしどり", "1-5"],
    ["あやつり", "デスフラッター", "6-10"],
    ["あやつり", "デッドペッカー", "6-10"],
    ["あやつり", "はなカワセミ", "6-10"],
    ["あやつり", "ガンコどり", "6-10"],
    ["あやつり", "キラーグース", "11-20"],
    ["あやつり", "モーザ", "11-20"],
    ["あやつり", "ダックカイト", "11-20"],
    ["あやつり", "キメラ", "21-26"],
    ["あやつり", "ヘルコンドル", "21-26"],
    ["あやつり", "サンダーバード", "21-26"],
    ["あやつり", "ロックちょう", "21-26"],
    ["しはい", "スライム", "1-5"],
    ["しはい", "ぶちスライム", "1-5"],
    ["しはい", "メタルスライム", "1-5"],
    ["しはい", "スライムツリー", "1-5"],
    ["しはい", "ドラゴスライム", "6-10"],
    ["しはい", "スライムつむり", "6-10"],
    ["しはい", "バブルスライム", "6-10"],
    ["しはい", "はねスライム", "6-10"],
    ["しはい", "ストーンスライム", "11-29"],
    ["しはい", "スラッピー", "11-20"],
    ["しはい", "スライムナイト", "11-20"],
    ["しはい", "ボックススライム", "11-20"],
    ["しはい", "ぶちキング", "21-29"],
    ["しはい", "スライムボーグ", "21-29"],
    ["しはい", "はぐれメタル", "21-29"],
    ["ねだやし", "グレムリン", "1-5"],
    ["ねだやし", "ベビーサタン", "1-5"],
    ["ねだやし", "ひとつめピエロ", "1-5"],
    ["ねだやし", "スカルライダー", "1-5"],
    ["ねだやし", "おおめだま", "6-10"],
    ["ねだやし", "メドーサボール", "6-10"],
    ["ねだやし", "ピクシー", "6-10"],
    ["ねだやし", "ダークアイ", "6-10"],
    ["ねだやし", "オーク", "11-20"],
    ["ねだやし", "シルバーデビル", "11-20"],
    ["ねだやし", "アークデーモン", "11-20"],
    ["ねだやし", "ヘルビースト", "11-20"],
    ["ねだやし", "ライオネック", "21-29"],
    ["ねだやし", "グレンデル", "21-29"],
    ["ねだやし", "オーガー", "21-29"],
    ["ねだやし", "アンクルホーン", "21-29"],
    ["ねむり", "ゴースト", "1-5"],
    ["ねむり", "くさったしたい", "1-5"],
    ["ねむり", "ボーンプリズナー", "1-5"],
    ["ねむり", "アニマルゾンビ", "1-5"],
    ["ねむり", "マッドロン", "6-10"],
    ["ねむり", "マミー", "6-10"],
    ["ねむり", "しりょうのきし", "6-10"],
    ["ねむり", "ナイトウィプス", "6-10"],
    ["ねむり", "しにがみ", "11-20"],
    ["ねむり", "ウィンドマージ", "11-20"],
    ["ねむり", "エビルスピリッツ", "11-20"],
    ["ねむり", "シャドー", "11-20"],
    ["ねむり", "やたがらす", "21-29"],
    ["ねむり", "ダーククラブ", "21-29"],
    ["ねむり", "スカルゴン", "21-29"],
    ["ねむり", "がいこつけんし", "21-29"],
    ["ねむり", "しにがみきぞく", "21-29"],
    ["バザー(召還)", "マドハンド", "1-5"],
    ["バザー(召還)", "ひとくいサーベル", "1-5"],
    ["バザー(召還)", "ネジまきどり", "1-5"],
    ["バザー(召還)", "どろにんぎょう", "1-5"],
    ["バザー(召還)", "トーテムキラー", "6-10"],
    ["バザー(召還)", "おばけキャンドル", "6-10"],
    ["バザー(召還)", "とげぼうず", "6-10"],
    ["バザー(召還)", "さまようよろい", "6-10"],
    ["バザー(召還)", "ギズモ", "11-20"],
    ["バザー(召還)", "のろいのランプ", "11-20"],
    ["バザー(召還)", "エビルワンド", "11-20"],
    ["バザー(召還)", "おどるほうせき", "11-20"],
    ["バザー(召還)", "あくまのカガミ", "11-20"],
    ["バザー(召還)", "ミステリドール", "21-29"],
    ["バザー(召還)", "バルザック", "21-29"],
    ["バザー(召還)", "メタルドラゴン", "21-29"],
    ["バザー(召還)", "キラーマシーン", "21-29"],
    ["バザー(召還)", "ばくだんいわ", "21-29"],
    ["格闘場(右)", "ファーラット", "1-5"],
    ["格闘場(右)", "フェアリーラット", "1-5"],
    ["格闘場(右)", "アルミラージ", "1-5"],
    ["格闘場(右)", "キャットフライ", "1-5"],
    ["格闘場(右)", "スカルガルー", "1-5"],
    ["格闘場(右)", "ミノーン", "6-10"],
    ["格闘場(右)", "ベロゴン", "6-10"],
    ["格闘場(右)", "キラースコップ", "6-10"],
    ["格闘場(右)", "かまいたち", "6-10"],
    ["格闘場(右)", "ももんじゃ", "6-10"],
    ["格闘場(右)", "ゴートドン", "11-20"],
    ["格闘場(右)", "おおきづち", "11-20"],
    ["格闘場(右)", "キラーイエプ", "11-20"],
    ["格闘場(右)", "グリズリー", "11-20"],
    ["格闘場(右)", "スーパーテンツク", "11-20"],
    ["格闘場(右)", "イエティ", "21-26"],
    ["格闘場(右)", "アイアンタートル", "21-26"],
    ["格闘場(右)", "ストロングアニマル", "21-26"],
    ["格闘場(右)", "パオーム", "21-26"],
    ["格闘場(右)", "ユニコーン", "21-26"],
    ["ガンコじじい", "コドラ", "1-5"],
    ["ガンコじじい", "ドラゴンキッズ", "1-5"],
    ["ガンコじじい", "とさかへび", "1-5"],
    ["ガンコじじい", "ポイズンリザード", "1-5"],
    ["ガンコじじい", "フェアリードラゴン", "6-10"],
    ["ガンコじじい", "プテラノドン", "6-10"],
    ["ガンコじじい", "フーセンドラゴン", "6-10"],
    ["ガンコじじい", "キングコブラ", "6-10"],
    ["ガンコじじい", "おおイグアナ", "6-10"],
    ["ガンコじじい", "リザードフライ", "11-20"],
    ["ガンコじじい", "ガメゴン", "11-20"],
    ["ガンコじじい", "リザードマン", "11-20"],
    ["ガンコじじい", "ソードドラゴン", "11-20"],
    ["ガンコじじい", "ウィングスネーク", "11-20"],
    ["ガンコじじい", "ライバーン", "21-29"],
    ["ガンコじじい", "デンタザウルス", "21-29"],
    ["ガンコじじい", "ドラゴンマッド", "21-29"],
    ["ガンコじじい", "アンドレアル", "21-29"],
    ["ガンコじじい", "グレイトドラゴン", "21-29"],
  ];

  updateTable(data); // 初期データ表示
});
