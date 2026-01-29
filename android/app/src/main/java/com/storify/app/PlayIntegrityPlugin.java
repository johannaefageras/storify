package com.storify.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.android.play.core.integrity.IntegrityManager;
import com.google.android.play.core.integrity.IntegrityManagerFactory;
import com.google.android.play.core.integrity.IntegrityTokenRequest;
import com.google.android.play.core.integrity.IntegrityTokenResponse;

import android.util.Log;

@CapacitorPlugin(name = "PlayIntegrity")
public class PlayIntegrityPlugin extends Plugin {
    private static final String TAG = "PlayIntegrityPlugin";
    private IntegrityManager integrityManager;

    @Override
    public void load() {
        super.load();
        integrityManager = IntegrityManagerFactory.create(getContext());
    }

    // Cloud project number for storify-v2 (get from Google Cloud Console dashboard)
    private static final long CLOUD_PROJECT_NUMBER = 1018057137441L;

    @PluginMethod
    public void requestIntegrityToken(PluginCall call) {
        String nonce = call.getString("nonce");

        if (nonce == null || nonce.isEmpty()) {
            call.reject("Nonce is required");
            return;
        }

        IntegrityTokenRequest request = IntegrityTokenRequest.builder()
                .setNonce(nonce)
                .setCloudProjectNumber(CLOUD_PROJECT_NUMBER)
                .build();

        integrityManager.requestIntegrityToken(request)
                .addOnSuccessListener(response -> {
                    String token = response.token();
                    JSObject result = new JSObject();
                    result.put("token", token);
                    call.resolve(result);
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Failed to get integrity token", e);
                    call.reject("Failed to get integrity token: " + e.getMessage(), e);
                });
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", true);
        call.resolve(result);
    }
}
