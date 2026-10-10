package com.unborne.retrogames;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/**
 * Offline Android shell for the existing Retro Games Arcade website.
 * WebViewAssetLoader gives packaged assets a secure HTTPS origin so storage
 * and relative JS imports work, with no internet permission required.
 */
public final class MainActivity extends Activity {
    private static final int FILE_PICKER_REQUEST = 101;
    private static final String HOME = "https://appassets.androidplatform.net/assets/www/index.html";

    private WebView webView;
    private ValueCallback<Uri[]> filePicker;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().setNavigationBarColor(Color.rgb(9, 13, 30));

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(9, 13, 30));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(
                    WebView view, WebResourceRequest request) {
                // Do not let user-supplied HTML navigate the shell to remote websites.
                Uri uri = request.getUrl();
                return !"appassets.androidplatform.net".equals(uri.getHost());
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view,
                    ValueCallback<Uri[]> callback,
                    WebChromeClient.FileChooserParams params) {
                if (filePicker != null) filePicker.onReceiveValue(null);
                filePicker = callback;
                try {
                    Intent intent = params.createIntent();
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(intent, FILE_PICKER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException exception) {
                    filePicker.onReceiveValue(null);
                    filePicker = null;
                    return false;
                }
            }
        });

        setContentView(webView);
        webView.loadUrl(HOME);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_PICKER_REQUEST && filePicker != null) {
            filePicker.onReceiveValue(
                    WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            filePicker = null;
        }
    }

    @Override
    public void onBackPressed() {
        // Close an open game/import dialog first, before leaving the app.
        webView.evaluateJavascript(
                "(function(){let d=[...document.querySelectorAll('dialog')]" +
                ".find(d=>d.open);if(d){d.close();return true;}return false;})()",
                result -> {
                    if (!"true".equals(result)) {
                        if (webView.canGoBack()) webView.goBack();
                        else finish();
                    }
                });
    }

    @Override
    protected void onDestroy() {
        if (filePicker != null) {
            filePicker.onReceiveValue(null);
            filePicker = null;
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
