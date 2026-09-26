/**
 * Kaamora App SDK (minimal)
 * Loaded by standalone apps at /apps/<slug>
 *
 * Usage:
 *   await Kaamora.run("process", async () => {
 *     // browser-side work
 *     return result;
 *   });
 *
 * Does NOT expose secrets or allow client-side price changes.
 */
(function (global) {
  "use strict";

  var APP_SLUG =
    (document.documentElement &&
      document.documentElement.getAttribute("data-kaamora-app")) ||
    (global.KAAMORA_APP_SLUG || "");

  function sessionId() {
    try {
      var key = "kaamora_sid";
      var sid = localStorage.getItem(key);
      if (!sid) {
        sid =
          "s_" +
          Math.random().toString(36).slice(2) +
          Date.now().toString(36);
        localStorage.setItem(key, sid);
      }
      return sid;
    } catch (e) {
      return "anon_" + Date.now();
    }
  }

  function uuid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  async function authorize(actionName, clientRequestId) {
    var res = await fetch("/api/actions/authorize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId(),
      },
      credentials: "same-origin",
      body: JSON.stringify({
        appSlug: APP_SLUG,
        actionName: actionName,
        clientRequestId: clientRequestId || uuid(),
        sessionId: sessionId(),
      }),
    });
    var data = await res.json().catch(function () {
      return { allowed: false, reason: "Network error" };
    });
    if (!res.ok && res.status !== 402) {
      throw new Error(data.error || "Authorization failed");
    }
    return data;
  }

  /**
   * Run a named action with server authorization first.
   * Processing callback runs only if allowed.
   */
  async function run(actionName, processingFn, options) {
    options = options || {};
    var requestId = options.requestId || uuid();

    if (typeof global.dispatchEvent === "function") {
      global.dispatchEvent(
        new CustomEvent("kaamora:action_started", {
          detail: { action: actionName, requestId: requestId },
        })
      );
    }

    var auth = await authorize(actionName, requestId);

    if (!auth.allowed) {
      var err = new Error(auth.reason || "Action not allowed");
      err.code = "KAAMORA_DENIED";
      err.auth = auth;
      if (typeof global.dispatchEvent === "function") {
        global.dispatchEvent(
          new CustomEvent("kaamora:action_failed", {
            detail: { action: actionName, reason: auth.reason },
          })
        );
      }
      throw err;
    }

    try {
      var result = await processingFn(auth);
      if (typeof global.dispatchEvent === "function") {
        global.dispatchEvent(
          new CustomEvent("kaamora:action_success", {
            detail: { action: actionName, cost: auth.cost, trial: auth.trial },
          })
        );
      }
      return result;
    } catch (e) {
      if (typeof global.dispatchEvent === "function") {
        global.dispatchEvent(
          new CustomEvent("kaamora:action_failed", {
            detail: { action: actionName, error: String(e) },
          })
        );
      }
      throw e;
    }
  }

  global.Kaamora = {
    run: run,
    authorize: authorize,
    getAppSlug: function () {
      return APP_SLUG;
    },
    getSessionId: sessionId,
  };
})(typeof window !== "undefined" ? window : this);
