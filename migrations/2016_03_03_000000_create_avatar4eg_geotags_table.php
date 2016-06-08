<?php
namespace Avatar4eg\Geotags\Migration;

use Flarum\Database\Migration;
use Illuminate\Database\Schema\Blueprint;

return Migration::createTable(
    'avatar4eg_geotags',
    function (Blueprint $table) {
        $table->increments('id');
        $table->integer('user_id')->unsigned()->nullable();
        $table->integer('post_id')->unsigned();
        $table->string('title')->nullable();
        $table->string('country');
        $table->decimal('lat', 11, 8);
        $table->decimal('lng', 11, 8);
        $table->timestamp('created_at');
    }
);
