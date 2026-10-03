use tauri::WebviewWindow;

#[tauri::command]
fn set_wallpaper_mode(window: WebviewWindow, enabled: bool) -> Result<(), String> {
    if enabled {
        let _ = window.set_always_on_bottom(true);
        let _ = window.set_fullscreen(true);
        let _ = window.set_decorations(false);
        let _ = window.set_shadow(false);
    } else {
        let _ = window.set_always_on_bottom(false);
        let _ = window.set_fullscreen(false);
        let _ = window.set_decorations(true);
        let _ = window.set_shadow(true);
    }
    Ok(())
}

#[tauri::command]
fn set_click_through(window: WebviewWindow, ignore: bool) -> Result<(), String> {
    window.set_ignore_cursor_events(ignore).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn set_always_on_top(window: WebviewWindow, on_top: bool) -> Result<(), String> {
    window.set_always_on_top(on_top).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn toggle_fullscreen(window: WebviewWindow) -> Result<bool, String> {
    let is_fs = window.is_fullscreen().map_err(|e| e.to_string())?;
    window.set_fullscreen(!is_fs).map_err(|e| e.to_string())?;
    Ok(!is_fs)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      set_wallpaper_mode,
      set_click_through,
      set_always_on_top,
      toggle_fullscreen,
    ])
    .setup(|_app| {
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
