/*===========================================

  BB1 - G Truslove

  Date: Feb 2018

  ===========================================*/

define('GDPRNewsletter.View', [
    'Backbone', 'Backbone.FormView', 'gdprnewsletter.tpl', 'GlobalViews.Message.View', 'jQuery', 'underscore', 'SC.Configuration', 'Tools', 'HeaderBar.Home.View'
], function(
    Backbone, BackboneFormView, GDPRNewsletterTpl, MessageView, jQuery, _, Configuration, Tools, HeaderBarHome
) {
    'use strict';

    return Backbone.View.extend({

        // When the view is rendered, it is wrapped in a div and then the template is loaded into that div. If you like, you can attach attributes to that div.
        attributes: {
            'class': 'GDPRNewsletter'
        },
        childViews: {
            HeaderBarHome: function(e) {
                return new HeaderBarHome({ template: "mini", application: this.application });
            }
        }
        // We use bindings so that inline (frontend) validation fires immediately after the user loses focus on a particular field. It's included in Backbone.FormView and uses the validation rules we set in our frontend model.
        ,
        bindings: {
            '[name="firstname"]': 'firstname',
            '[name="lastname"]': 'lastname',
            '[name="email"]': 'email'
        }

        // Attaches listeners to frontend actions using jQuery selectors. We normally use the saveForm function from Backbone.FormView, which is a generic 'submit' function for sending data. However, we want to add in our own functionality to this event, so we're writing our own.
        ,
        events: {
            'submit form': 'saveTheForm'
        }
        ,
        getBreadcrumbPages: function() {
            return [{
                text: _('Newsletter').translate(),
                href: '/newsletter'
            }]
        }
        ,
        initialize: function(options) {
                this.options = options;
                this.application = options.application;

                BackboneFormView.add(this);
            }

            // Our custom saveForm function. First we remove any error messages that may have been generated by this function via previous calls. Then we create a promise out of the submission of the form via the saveForm method. With that we then have two callbacks: one for success and one for failure, which will generate messaging appropriate for what happened.
            ,
        saveTheForm: function(e) {
                var IAgree = $("#iagree").is(":checked");
                if (!IAgree) {
                    SC.Tools.showErrorInModal(this.application, _("Terms & Conditions").translate(), _("Please agree to the terms and conditions.").translate());
                    return false;
                }

                jQuery('form .global-views-message').parent().remove();

                var self = this;
                var promise = BackboneFormView.saveForm.apply(this, arguments);

                e.preventDefault();

                return promise && promise.then(
                    function(success) {
                        if (success.successMessage) {
                            console.log("Show success " + JSON.stringify(success));
                            //Tools.showSuccessInModal(self.application,_('Message Received').translate(),_(success.successMessage).translate());

                            Backbone.history.navigate('newsletter/thank-you', { trigger: true });

                        } else {
                            console.log("error " + success.message);
                            Tools.showErrorInModal(self.application, _('Error').translate(), _(success.message).translate() + "<br /><br />" + success.stack);
                        }
                    },
                    function(fail) {
                        console.log("fail!!! " + fail.responseJSON.errorMessage);
                        fail.preventDefault = true;

                        Tools.showErrorInModal(self.application, _('Error').translate(), _(fail.responseJSON.errorMessage).translate());

                    }
                );
            }

            // The function we use to actually generate the messages. It uses the global message view functionality, which is a simple of way of creating messages throughout the site, ensuring that they all look consistent. Depending on whether it is passed a field, it will generate the message either at that field's location, or simply at the bottom of the form.
            ,
        showMessage: function(message, type, field) {
                var messageView = new MessageView({
                    message: message,
                    type: type
                });

                if (typeof field !== 'undefined') {
                    this.application.getLayout().$('[data-input="' + field + '"]').append(messageView.render().$el);
                } else {
                    this.application.getLayout().$('form').append(messageView.render().$el);
                }
            }

            // Quite simply, the template we want to use.
            ,
        template: GDPRNewsletterTpl

            // Set the page title
            ,
        getTitle: function() {
            return SC.Tools.getTitle("Newsletter");
        },
        getMetaDescription: function() {
            return "Subscribe to out newsletter.";
        },

        getAddToHead: function() {
                return SC.Tools.getSEO({ title: "Newsletter", summary: this.getMetaDescription() });
            }

            ,
        getContext: function() {
            return {
                usecompanies: Configuration.get('GDPRNewsletter.usecompanies'),
                host: document.location.host
            };
        }
    });
});