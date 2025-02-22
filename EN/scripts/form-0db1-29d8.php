<?php

require_once('FormProcessor.php');

$form = array(
    'subject' => 'Yeni Form Gönder',
    'email_message' => 'Yeni bir form gönderiminiz var',
    'success_redirect' => '',
    'sendIpAddress' => true,
    'email' => array(
    'from' => 's3audi@hotmail.com',
    'to' => 's3audi@hotmail.com',
    'toCopy' => 's3audi@hotmail.com',
    'toHiddenCopy' => 'semta@semta.com.tr'
    ),
    'fields' => array(
    'name' => array(
    'order' => 1,
    'type' => 'string',
    'label' => 'Your Name',
    'required' => true,
    'errors' => array(
    'required' => 'Field \'Your Name\' is required.'
    )
    ),
    'email' => array(
    'order' => 2,
    'type' => 'email',
    'label' => 'Email',
    'required' => true,
    'errors' => array(
    'required' => 'Field \'Email\' is required.'
    )
    ),
    'message' => array(
    'order' => 3,
    'type' => 'string',
    'label' => 'How can we assist you?',
    'required' => true,
    'errors' => array(
    'required' => 'Field \'How can we assist you?\' is required.'
    )
    ),
    )
    );

    $processor = new FormProcessor('');
    $processor->process($form);

    ?>