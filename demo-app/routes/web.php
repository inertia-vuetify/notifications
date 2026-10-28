<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Demo');
})->name('demo');

// Demo flash routes - showcase Inertia::flash() functionality
Route::prefix('demo/flash')->name('demo.flash.')->group(function () {
    // Simple flash messages
    Route::post('success', function () {
        Inertia::flash('success', 'Item saved successfully!');

        return back();
    })->name('success');

    Route::post('error', function () {
        Inertia::flash('error', 'Something went wrong. Please try again.');

        return back();
    })->name('error');

    Route::post('warning', function () {
        Inertia::flash('warning', 'Please review your input before continuing.');

        return back();
    })->name('warning');

    Route::post('info', function () {
        Inertia::flash('info', 'New features are now available!');

        return back();
    })->name('info');

    // Structured notification with options
    Route::post('structured', function () {
        Inertia::flash('notification', [
            'message' => 'Server-side structured notification with custom options',
            'type' => 'info',
            'timeout' => 8000,
            'closable' => true,
        ]);

        return back();
    })->name('structured');

    // Notification with actions
    Route::post('with-actions', function () {
        $itemId = rand(100, 999);
        Inertia::flash('notification', [
            'message' => "Item #{$itemId} moved to trash",
            'type' => 'warning',
            'timeout' => 10000,
            'actions' => [
                [
                    'label' => 'Undo',
                    'name' => 'undo-delete',
                    'payload' => ['id' => $itemId, 'name' => "Item #{$itemId}"],
                ],
                [
                    'label' => 'View Trash',
                    'method' => 'get',
                    'url' => '/',
                ],
            ],
        ]);

        return back();
    })->name('with-actions');

    // Multiple flash messages at once
    Route::post('multiple', function () {
        Inertia::flash([
            'success' => 'Data saved successfully!',
            'info' => 'Your changes will be reviewed.',
        ]);

        return back();
    })->name('multiple');
});
