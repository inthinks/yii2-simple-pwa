<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\web\Response;
use yii\filters\VerbFilter;
use app\models\LoginForm;
use app\models\ContactForm;
use app\models\News;
use yii\helpers\Url;
use Exception;

class SiteController extends Controller
{
    private $BOT_TOKEN = '';

    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['logout'],
                'rules' => [
                    [
                        'actions' => ['logout'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'logout' => ['post'],
                ],
            ],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
            'captcha' => [
                'class' => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }

    /**
     * Displays list of news.
     *
     * @return string
     */
    public function actionIndex()
    {
        $model = News::find()->all();
        return $this->render('index',[
            'model' => $model
        ]);
    }

    /**
     * Displays detail of news.
     *
     * @return string
     */
    public function actionDetail($guid)
    {
        $model = News::find()->where([
            'guid' => $guid
        ])->one();
        
        return $this->render('detail', [
            'model' => $model
        ]);
    }

    /**
     * Login action.
     *
     * @return Response|string
     */
    public function actionLogin()
    {
        // function getTelegramUserData() {
        //     if (isset($_COOKIE['tg_user'])) {
        //       $auth_data_json = urldecode($_COOKIE['tg_user']);
        //       $auth_data = json_decode($auth_data_json, true);
        //       return $auth_data;
        //     }
        //     return false;
        //   }
          
        //   if ($_GET['logout']) {
        //     setcookie('tg_user', '');
        //     header('Location: login_example.php');
        //   }
          
        //   $tg_user = getTelegramUserData();
        //   if ($tg_user !== false) {
        //     $first_name = htmlspecialchars($tg_user['first_name']);
        //     $last_name = htmlspecialchars($tg_user['last_name']);
        //     if (isset($tg_user['username'])) {
        //       $username = htmlspecialchars($tg_user['username']);
        //       $html = "<h1>Hello, <a href=\"https://t.me/{$username}\">{$first_name} {$last_name}</a>!</h1>";
        //     } else {
        //       $html = "<h1>Hello, {$first_name} {$last_name}!</h1>";
        //     }
        //     if (isset($tg_user['photo_url'])) {
        //       $photo_url = htmlspecialchars($tg_user['photo_url']);
        //       $html .= "<img src=\"{$photo_url}\">";
        //     }
        //     $html .= "<p><a href=\"?logout=1\">Log out</a></p>";
        //   } else {
        //     $bot_username = 'sec2bot';
        //     $html = <<<HTML
        //   <h1>Hello, anonymous!</h1>
        //   <script async src="https://telegram.org/js/telegram-widget.js?2" data-telegram-login="{$bot_username}" data-size="large" data-auth-url="check_authorization.php"></script>
        //   HTML;
        //   }
          
          
        //     echo <<<HTML
        //   <!DOCTYPE html>
        //   <html>
        //     <head>
        //       <meta charset="utf-8">
        //       <title>Login Widget Example</title>
        //     </head>
        //     <body><center>{$html}</center></body>
        //   </html>
        //   HTML;
          
        if (!Yii::$app->user->isGuest) {
            return $this->goHome();
        }

        $model = new LoginForm();
        if ($model->load(Yii::$app->request->post()) && $model->login()) {
            return $this->goBack();
        }

        $model->password = '';
        return $this->render('login', [
            'model' => $model,
        ]);
    }

    /**
     * Logout action.
     *
     * @return Response
     */
    public function actionLogout()
    {
        Yii::$app->user->logout();

        return $this->goHome();
    }

    /**
     * Displays contact page.
     *
     * @return Response|string
     */
    public function actionContact()
    {
        $model = new ContactForm();
        if ($model->load(Yii::$app->request->post()) && $model->contact(Yii::$app->params['adminEmail'])) {
            Yii::$app->session->setFlash('contactFormSubmitted');

            return $this->refresh();
        }
        return $this->render('contact', [
            'model' => $model,
        ]);
    }

    /**
     * Displays about page.
     *
     * @return string
     */
    public function actionAbout()
    {
        try {
            $auth_data = $this->checkTelegramAuthorization($_GET);
            $this->saveTelegramUserData($auth_data);
            // Url::to('login');
            return $this->render('about');
          } catch (Exception $e) {
            die ($e->getMessage());
          }

        return $this->render('about');
    }

    /**
     * Telegram Bot 
     */
    private function checkTelegramAuthorization($auth_data) 
    {
        $check_hash = $auth_data['hash'];
        unset($auth_data['hash']);
        $data_check_arr = [];
        foreach ($auth_data as $key => $value) {
          $data_check_arr[] = $key . '=' . $value;
        }
        sort($data_check_arr);
        $data_check_string = implode("\n", $data_check_arr);
        $secret_key = hash('sha256', $this->BOT_TOKEN, true);
        $hash = hash_hmac('sha256', $data_check_string, $secret_key);
        if (strcmp($hash, $check_hash) !== 0) {
          throw new Exception('Data is NOT from Telegram');
        }
        if ((time() - $auth_data['auth_date']) > 86400) {
          throw new Exception('Data is outdated');
        }
        return $auth_data;
      }
      
    private function saveTelegramUserData($auth_data) {
        $auth_data_json = json_encode($auth_data);
        setcookie('tg_user', $auth_data_json);
    }
      
}
