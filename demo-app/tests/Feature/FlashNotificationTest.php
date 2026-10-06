<?php

namespace Tests\Feature;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class FlashNotificationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutExceptionHandling();
        $page = $this->get('/')->assertOk()->viewData('page');
        $this->withHeader('X-Inertia-Version', $page['version'] ?? '');
    }

    public static function simpleNotifications(): array
    {
        return [
            ['success', 'Item saved successfully!'],
            ['error', 'Something went wrong. Please try again.'],
            ['warning', 'Please review your input before continuing.'],
            ['info', 'New features are now available!'],
        ];
    }

    #[DataProvider('simpleNotifications')]
    public function test_redirect_delivers_flash_once(string $key, string $message): void
    {
        $this->from('/')->post('/demo/flash/'.$key)->assertRedirect('/');

        $this->get('/', ['X-Inertia' => 'true'])
            ->assertOk()
            ->assertJsonPath('component', 'Demo')
            ->assertJsonPath('flash.'.$key, $message);

        $this->get('/', ['X-Inertia' => 'true'])
            ->assertOk()
            ->assertJsonMissingPath('flash.'.$key);
    }

    public function test_structured_notification_preserves_options(): void
    {
        $this->from('/')->post('/demo/flash/structured')->assertRedirect('/');

        $this->get('/', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('flash.notification', [
                'message' => 'Server-side structured notification with custom options',
                'type' => 'info',
                'timeout' => 8000,
                'closable' => true,
            ]);
    }

    public function test_named_and_url_actions_survive_redirect(): void
    {
        $this->from('/')->post('/demo/flash/with-actions')->assertRedirect('/');

        $response = $this->get('/', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('flash.notification.actions.0.name', 'undo-delete')
            ->assertJsonPath('flash.notification.actions.1.url', '/')
            ->assertJsonPath('flash.notification.actions.1.method', 'get');

        $id = $response->json('flash.notification.actions.0.payload.id');
        $this->assertIsInt($id);
        $response->assertJsonPath('flash.notification.message', "Item #{$id} moved to trash");
    }

    public function test_multiple_flash_keys_survive_redirect(): void
    {
        $this->from('/')->post('/demo/flash/multiple')->assertRedirect('/');

        $this->get('/', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('flash.success', 'Data saved successfully!')
            ->assertJsonPath('flash.info', 'Your changes will be reviewed.');
    }
}
