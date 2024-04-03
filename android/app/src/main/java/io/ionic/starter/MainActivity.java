package io.ionic.starter;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;
import com.getcapacitor.Capacitor;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

import android.content.Context;
import android.media.MediaScannerConnection;
import android.net.Uri;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Register your custom plugin
        registerPlugin(MediaScannerPlugin.class);
    }
}

public class MediaScannerPlugin extends Plugin {
    private MediaScannerConnection mediaScannerConnection;

    @Override
    public void load() {
        // 注册一个方法到 JavaScript 端
        registerMethod(new PluginMethod("scanFile", this::scanFile, true));
    }

    private void scanFile(PluginCall call, String filePath) {
        final Context context = this.getBridge().getContext();
        final Uri uri = Uri.fromFile(new File(filePath));

        if (mediaScannerConnection == null) {
            mediaScannerConnection = new MediaScannerConnection(context, new MediaScannerConnection.OnScanCompletedListener() {
                @Override
                public void onScanCompleted(String path, Uri uri) {
                    call.resolve();
                    mediaScannerConnection = null;
                }
            });
        }

        mediaScannerConnection.connect();
        mediaScannerConnection.scanFile(uri.toString(), null);
    }
}