$(document).ready(function () {
    const MIN_UNSUCCESSFUL_FOLLOW_UP_ATTEMPTS = 4, LOST_TO_FOLLOW_UP_CODE = 'Lost to follow-up', OTHER_CODE = 'Other';

    $('div#other_external_organization').hide();
    $('#external-organization-select').change(function () {
        var selectedExternalOrganization = $(this).find(':selected');
        var otherOption = "Other";
        if (selectedExternalOrganization.text() == otherOption) {
            $('div#other_external_organization').show();
        } else {
            $('div#other_external_organization').hide();
            $('#other-external-organization').val('');
        }
    });

    $('#form_demographics #id_date_of_enrollment').change(function (event) {
        event.preventDefault();
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/getMinMaxDateOfBirth',
            type: "POST",
            dataType: 'json',
            data: {
                csrfmiddlewaretoken: csrftoken,
                'date_of_enrollment': $(this).val(),
            },
            success: function (data) {
                $("#form_demographics #id_date_of_birth").val('');
                $("#form_demographics #id_date_of_birth").datepicker("option", "maxDate", new Date(data.max_dob));
                $("#form_demographics #id_date_of_birth").datepicker("option", "minDate", new Date(data.min_dob));
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

    $('#enrollment-form #id_date_of_enrollment').change(function(event){
        event.preventDefault();
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/getMinMaxDateOfBirth',
            type: "POST",
            dataType: 'json',
            data: {
                csrfmiddlewaretoken: csrftoken,
                'date_of_enrollment': $(this).val(),
            },
            success: function (data) {
                $("#enrollment-form #id_date_of_birth").val('');
                $("#enrollment-form #id_date_of_birth").datepicker("option", "maxDate", new Date(data.max_dob));
                $("#enrollment-form #id_date_of_birth").datepicker("option", "minDate", new Date(data.min_dob));
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

    $('#client-make-referral-form #referral-date').change(function(event){
        var selectedDate = new Date($('#client-make-referral-form #referral-date').val());
        var expiry_days = 60;
        selectedDate.setDate(selectedDate.getDate() + expiry_days);
        var year = selectedDate.getFullYear();
        var month = '00' + (selectedDate.getMonth() + 1);
        var day = '00' + selectedDate.getDate();
        var expiryDate = year + '-' + month.substr(month.length - 2, month.length)  + '-' + day.substr(day.length - 2, day.length);
        $('#client-make-referral-form #expiry-date').val(expiryDate);
    });

    $('div#other-external-organization-div').hide();
    $('#client-make-referral-form select#referral-external-organization-select').change(function(event){
        if ($(this).children("option:selected").text() == 'Other') {
            $('div#other-external-organization-div').show();
        } else {
             $('div#other-external-organization-div').hide();
             $('#other-organization-name').val("");
        }
    });

    $("#date-of-completion").datepicker({
         beforeShow: function (input, inst) {
             $(document).off('focusin.bs.modal');
         },
         onClose: function () {
             $(document).on('focusin.bs.modal');
         },
        maxDate: '0y 0m 0d',
        minDate: (new Date($('#current_date').val())),
        changeMonth: true,
        changeYear: true
    });

    $('input#external-organization-checkbox').change(function () {
        if (this.checked) {
            $('fieldset#external_organization_more_section').removeClass('hidden');
            $("#date-of-completion").datepicker("option", "minDate", new Date(1970, 0, 0));
        } else {
            $('fieldset#external_organization_more_section').addClass('hidden');
            $("#date-of-completion").datepicker("option", "minDate", new Date($('#current_date').val()));
        }
    });

    if ($('input[name=ovc_checkbox]').prop('checked')) {
        $('fieldset#ovc_more_section').removeClass('hidden');
    }

    $('input[name=ovc_checkbox]').change(function () {
        if (this.checked) {
            $('fieldset#ovc_more_section').removeClass('hidden');
        } else {
            $('fieldset#ovc_more_section').addClass('hidden');
        }
    });

    $('#alert_modal').on('shown.bs.modal', function (e) {
        setTimeout(function () {
            $('#alert_modal').modal('hide');
        }, 5000);
    });

    $('#alert_enrollment_modal').on('shown.bs.modal', function (e) {
        setTimeout(function () {
            $('#alert_enrollment_modal').modal('hide');
        }, 5000);
    });

    $('#i_types').change(function () {
        fetchRelatedInterventions();
    });

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    $('#dp-login-form').submit(function (event) {
        event.preventDefault();
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/',
            type: "POST",
            dataType: 'json',
            data: $('#dp-login-form').serialize(),
            success: function (data) {
                result = $.parseJSON(data);
                if (result.status == 'success') {
                    window.location.href = "/clients";
                }
                else {
                    $('.invalid-password-span').removeClass('hidden');
                    $('.invalid-password-span').html(result.message);
                }
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

    function insertClientTableRow(clients_tbody, pk, dreams_id, first_name, middle_name, last_name, date_of_enrollment, append, can_manage_client, can_change_client, can_delete_client) {
        var is_superuser = $('#is_superuser').val();
        var row_string = "<tr id='clients_row_" + pk + "' style='cursor: pointer;'>"
            + "<td>" + dreams_id + "</td>"
            + "<td>" + first_name + " " + middle_name + " " + last_name + "</td>"
            + "<td>" + date_of_enrollment + "</td>"
            + "<td id='client_' + " + pk + "'>"
            + "<div class='btn-group'>"
            + "<button type='button' class='btn btn-sm btn-default' onclick=\"window.location='/client?client_id=" + pk + "'\" style='cursor: pointer;'> Interventions </button>"
            + "<button type='button' class='btn btn-sm btn-default dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
            + "<span class='caret'></span>"
            + "<span class='sr-only'>Toggle Dropdown</span>"
            + "</button>"
            + "<ul class='dropdown-menu'>";
        if (can_manage_client) {
            row_string += "<li><a href='#' class='edit_intervention_click edit_client' data-view_mode='view' data-toggle='modal' data-target='#enrollment-modal' data-client_id='" + pk + "' style='cursor: pointer;word-spacing: 0px !important;'> View Enrollment </a></li>";
            row_string += "<li><a href=\"/client_baseline_info?client_id=" + pk + "\" style='cursor: pointer;word-spacing: 0px !important;'> Baseline Information </a></li>";
            if (can_change_client)
                row_string += "<li><a href='#' class='edit_intervention_click edit_client' data-toggle='modal' data-target='#enrollment-modal' data-client_id='" + pk + "' style='cursor: pointer;word-spacing: 0px !important;'> Edit Enrollment </a></li>"
            if (can_delete_client)
                row_string += "<li><a href='#' class='delete_intervention_click ' data-client_id='" + pk + "' id='delete_client_a_" + pk + "' data-confirm-client-delete='Are you sure you want to delete?'> Delete Enrollment &nbsp;&nbsp;&nbsp;</a></li>"
        }
        row_string += "</ul>"
            + "</div>"
            + "</td>"
            + "</tr>";

        if (append)
            clients_tbody.append(row_string);
        else
            clients_tbody.prepend(row_string);
        $('#delete_client_a_' + pk).click(function (event) {
            var clientId = $(this).data('client_id');
            $('#confirmationModal #frm_title').html('Confirm Client Delete Action');
            $('#confirmationModal #frm_body > h4').html('Are you sure you want to delete this client? Changes cannot be undone');
            $('#confirmationModal').modal({show: true});
            $('#confirmationModal #dataConfirmOK').click(function (event) {
                deleteClient(clientId);
            });
        });
    }

    $('#clients_search_form').submit(function (event) {
        event.preventDefault();
        var searchOption = $('#clientSearchOption').val();
        if (searchOption == "search_dreams_id") {
            if ($('#search-term-dreams_id').val() == "") {
                $('#client_search_errors').html("* MISSING DREAMS ID: Please enter a valid DREAMS ID.").removeClass("hidden").addClass("shown");
                return;
            }
        } else if (searchOption == "search_name") {
            var namePartsArray = [$('#search-term-first_name').val(), $('#search-term-middle_name').val(), $('#search-term-last_name').val()]
            var validParts = 0;
            $.each(namePartsArray, function (index, namePart) {
                if ($.trim(namePart) != "")
                    validParts++;
            });

            if (validParts < 2) {
                $('#client_search_errors').html("* INCOMPLETE DETAILS: Please enter at least 2 names.").removeClass("hidden").addClass("shown");
                return;
            }
        }

        $('#client_search_errors').html("").addClass("hidden");
        var csrftoken = getCookie('csrftoken');
        $(this).unbind("submit").submit();
    });

    $('#intervention-modal').on('show.bs.modal', function (event) {
        $('#btn_save_intervention').removeAttr("disabled");
        var button = $(event.relatedTarget);
        var currentClientId = $('#current_client_id').val();
        var interventionCategoryCode = $("#dreams-profile-tab-control ul li.active a").data('intervention_category_code');
        if (currentClientId == null || interventionCategoryCode == null)
            return;

        fetchRelatedInterventions(interventionCategoryCode, currentClientId);
        fetchExternalOrganisations('external-organization-select', 'intervention-modal');

        if ((typeof $(button).data('whatever') != 'undefined' && $(button).data('whatever') != null)) {
            modalMode = "new";
            $('#intervention-modal #intervention-type-select').val('').change();
        } else {
            modalMode = "edit";
            $('#intervention_id').val(intervention.pk);
            $('#intervention-modal #intervention-type-select').val(currentInterventionType.fields.code).change();
            prePopulateInterventionModal(intervention, currentInterventionType);
        }
    });

    $('#intervention-modal').on('hide.bs.modal', function (event) {
        $('#intervention-type-select').removeAttr('disabled');
        $('div#external_organization_section').addClass('hidden');
        $('#error-space').text("");
        $('#comments-text').val("");
        intervention = null;
    });

    $('#referral-intervention-modal').on('hide.bs.modal', function (event) {
        $('div#referral_external_organization_section').addClass('hidden');
        $('#referral-intervention-entry-form').trigger('reset');
    });

    $('.filter').keyup(function () {
        var targetTable = $(this).data("target_tbody");
        var filterValue = $(this).val();
        filterTable(targetTable, filterValue);
    });

    $('.nav-tabs a[href="#' + "behavioural-interventions" + '"]').tab('show');
    $('.nav-tabs a[href="#' + "demographics" + '"]').tab('show');

    function getResultName(results_list, has_resultType, resultId) {
        var resultName = "";
        if (!has_resultType)
            return resultName;
        else {
            $.each(results_list, function (index, resultObject) {
                if (resultObject.pk == resultId)
                    resultName = resultObject.fields.name;
            });
        }
        return resultName;
    }

    $('#dreams-profile-tab-control a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target);
        var panel_id = target.attr('href');
        var intervention_category_code = target.data("intervention_category_code");
        var table_id = $(this).data("tab_intervention_table_id");
        var row_count = $(table_id + '  tbody  tr').length;
        if (row_count > 0)
            return;

        var spinner = $(panel_id + ' .spinner');
        spinner.removeClass('hidden');
        var csrftoken = getCookie('csrftoken');
        $('#intervention_category_code').val(intervention_category_code);

        $.ajax({
            url: "/ivList",
            type: "POST",
            dataType: 'json',
            data: {
                csrfmiddlewaretoken: csrftoken,
                intervention_category_code: intervention_category_code,
                client_id: $('#current_client_id').val()
            },
            success: function (data) {
                var ivs = $.parseJSON(data.interventions);
                var ivTypes = $.parseJSON(data.iv_types);
                var hts_results = $.parseJSON(data.hts_results);
                var pregnancy_results = $.parseJSON(data.pregnancy_results);
                var permissions = $.parseJSON(data.permissions);
                interventionPermissionsGlobal = permissions;

                $(table_id + '  tbody').empty();
                $.each(ivs, function (index, iv) {
                    if (data.is_visible_by_ip[iv.pk] == true) {
                        var iv_type = {};
                        $.each(ivTypes, function (index, obj) {
                            if (obj.pk == iv.fields.intervention_type) {
                                iv_type = obj;
                                return false;
                            }
                        });
                        var hts_result = iv_type.fields.has_hts_result ? getResultName(hts_results, iv_type.fields.has_hts_result, iv.fields.hts_result) : "";
                        var pregnancy_result = iv_type.fields.has_pregnancy_result ? getResultName(pregnancy_results, iv_type.fields.has_pregnancy_result, iv.fields.pregnancy_test_result) : "";
                        iv.fields.client_ccc_number = iv.fields.client_ccc_number == null ? "" : iv.fields.client_ccc_number;
                        iv.fields.no_of_sessions_attended = iv.fields.no_of_sessions_attended == null ? "" : iv.fields.no_of_sessions_attended;

                        if (data.is_editable_by_ip[iv.pk] == false || data.client_is_exited[iv.pk] == false) {
                            permissions = null;
                        }

                        insertInterventionEntryInView(table_id, iv, iv_type, intervention_category_code, hts_result, pregnancy_result, false, permissions);
                    }
                });

                $(panel_id + ' .spinner').addClass('hidden');
                var new_row_count = $(table_id + '  tbody  tr').length;

                if (new_row_count < 1) {
                    var cols = $(table_id).data('cols');
                    $(table_id + '  tbody').append("<tr class='zero_message_row'><td  colspan='" + cols + "' class='table-message'> No interventions found</td></tr>");
                }
            },

            error: function (xhr, errmsg, err) {
                interventionPermissionsGlobal = null;
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    });

    function filterTable(table_id, filter_value) {
        var rex = new RegExp(filter_value, 'i');
        $(table_id + ' tr').hide();
        $(table_id + ' tr').filter(function () {
            return rex.test($(this).text());
        }).show();
    }

    var interventionTypes;
    function fetchAndLoadInterventionTypes() {
        $.ajax({
            url: "/getInterventionTypes",
            type: "GET",
            dataType: 'json',
            async: false,
            success: function (data) {
                interventionTypes = $.parseJSON(data.intervention_types);
                $('#referral-category-interventions-select').val($("#referral-category-interventions-select option:first").val()).change();
                },
            error: function (xhr, errmsg, err) {
                alert(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    function fetchAndLoadImplementingPartners() {
        var client_id = $('input[type=hidden]#referral-client-id').val();
        $.ajax({
            url: "/getImplementingPartners",
            type: "GET",
            dataType: 'json',
            async: false,
            data: { 'referral-client-id': client_id  },
            success: function (data) {
                var implementingPartners = $.parseJSON(data.implementing_partners);
                setSelectOptions(implementingPartners, '#implementing-partners-select', 'Select Implementing Partner');
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    function fetchAndLoadExternalOrganizations() {
        $.ajax({
            url: "/getExternalOrganisations",
            type: "GET",
            dataType: 'json',
            async: false,
            success: function (data) {
                var externalOrganizations = $.parseJSON(data.external_orgs);
                setSelectOptions(externalOrganizations, '#referral-external-organization-select', 'Select External Organization');
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    $('div#external-organization-div').hide();
    $('input[type=checkbox]#to-external-organization').change(function() {
       if (this.checked) {
           $('div#implementing-partner-div').hide();
           $('div#external-organization-div').show();
           $("#referral-external-organization-select option:first").prop('selected','selected');
       } else {
           $('div#external-organization-div').hide();
           $('div#other-external-organization-div').hide();
           $('#other-organization-name').val("");
           $('div#implementing-partner-div').show();
           $("#implementing-partners-select option:first").prop('selected','selected');
       }
    });

    function fetchAndLoadExitReasons() {
        $.ajax({
            url: "/getExitReasons",
            type: "GET",
            dataType: 'json',
            async: false,
            success: function (data) {
                exitReasons = $.parseJSON(data.exit_reasons);
                setExitReasonsSelect(exitReasons);
            },
            error: function (xhr, errmsg, err) {
                alert(errmsg);
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    followupAttempts = 0;
    function fetchFollowUpAttempts() {
        var currentClientId = $('#current_client_id').val();
        $.ajax({
            url: "/getUnsuccessfulFollowUpAttempts",
            type: "GET",
            dataType: 'json',
            async: false,
            data: {
                current_client_id: currentClientId
            },
            success: function (data) {
                followupAttempts = $.parseJSON(data.unsuccessful_follow_up_attempts);
            },
            error: function (xhr, errmsg, err) {
                $('span#exit_reason_validation').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg + " <a href='#' class='close'>&times;</a></div>");
            }
        });
    }

    function setExternalOrganisationsSelect(externalOrganisations) {
        var externalOrganisationSelect = $('#external-organization-select');
        externalOrganisationSelect.empty();
        externalOrganisationSelect.append($("<option />").attr("value", '').text('Select External Organisation').addClass('selected disabled hidden').css({display: 'none'}));

        if (externalOrganisations.length > 0) {
            $.each(externalOrganisations, function () {
                externalOrganisationSelect.append($("<option />").attr("value", this.pk).text(this.fields.name));
            });
        }
    }

    function fetchExternalOrganisations(select_to_populate, form_id) {
        $('#' + form_id + ' .processing-indicator').removeClass('hidden');
        $.ajax({
            url: "/getExternalOrganisations",
            type: "GET",
            dataType: 'json',
            async: false,
            success: function (data) {
                externalOrganisations = $.parseJSON(data.external_orgs);
                setSelectOptions(externalOrganisations, '#' + select_to_populate, "Select External Organisation");
                $('#' + form_id + ' .processing-indicator').addClass('hidden');
            },
            error: function (xhr, errmsg, err) {
                alert(errmsg);
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
                $('#' + form_id + ' .processing-indicator').addClass('hidden');
            }
        });
    }

    function fetchRelatedInterventions(interventionCategoryCode, currentClientId) {
        currentInterventionCategoryCode_Global = interventionCategoryCode;
        var csrftoken = getCookie('csrftoken');
        $('#intervention-entry-form .processing-indicator').removeClass('hidden');

        $.ajax({
            url: "/ivgetTypes",
            type: "POST",
            dataType: 'json',
            async: false,
            data: {
                csrfmiddlewaretoken: csrftoken,
                category_code: interventionCategoryCode,
                current_client_id: currentClientId
            },
            success: function (data) {
                interventionTypes = $.parseJSON(data.itypes);
                setInterventionTypesSelect(interventionTypes);
                $('#intervention-entry-form .processing-indicator').addClass('hidden');
            },
            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
                $('#intervention-entry-form .processing-indicator').addClass('hidden');
            }
        });
    }

    function setSelectOptions(selectOptions, selectID, defaultText, checkAgeRestriction=false) {
        var select = $(selectID);
        select.empty();
        select.append($("<option />").attr("value", '').text(defaultText).addClass('selected disabled hidden').css({display: 'none'}));

        if (selectOptions.length > 0) {
            if (checkAgeRestriction) {
                $.each(selectOptions, function () {
                    select.append($("<option />").attr("value", this.pk).attr("is_age_restricted", this.fields.is_age_restricted)
                        .attr("min_age", this.fields.min_age).attr("max_age", this.fields.max_age).text(this.fields.name));
                });
            } else {
                $.each(selectOptions, function () {
                    select.append($("<option />").attr("value", this.pk).text(this.fields.name));
                });
            }
        }
    }

    function setExitReasonsSelect(exitReasons) {
        var exitReasonsSelect = $('select#reason_for_exit');
        exitReasonsSelect.empty().append($("<option />").attr("value", '').text('Select Exit Reason').addClass('selected disabled hidden').css({display:'none'}));

        if (exitReasons.length > 0) {
            $.each(exitReasons, function () {
                exitReasonsSelect.append($("<option />").attr("value", this.pk).text(this.fields.name));
            });
        }
    }

    function setInterventionTypesSelect(interventionTypes) {
        var interventionTypeSelect = $('#intervention-type-select');
        var currentClientAge = $('#current_client_age').val();
        interventionTypeSelect.empty();
        interventionTypeSelect.append($("<option />").attr("value", '').text('Select Intervention').addClass('selected disabled hidden').css({display: 'none'}));
        $.each(interventionTypes, function () {
            interventionTypeSelect.append($("<option />").attr("value", this.fields.code).attr("is_age_restricted", this.fields.is_age_restricted)
                .attr("min_age", this.fields.min_age).attr("max_age", this.fields.max_age).text(this.fields.name));
        });

        $(interventionTypeSelect).change(function () {
            var it = $(this).find(":selected");
            var is_age_restricted = it.attr('is_age_restricted');
            if (eval(is_age_restricted) && (currentClientAge < it.attr("min_age") || currentClientAge > it.attr("max_age"))) {
                $('#div_out_of_age_bracket_warning').fadeIn('fast');
                $('#div_out_of_age_bracket_warning').removeClass('hide');
            } else {
                if (!$('#div_out_of_age_bracket_warning').hasClass("hide")) {
                    $('#div_out_of_age_bracket_warning').fadeOut('fast', function () {
                        $('#div_out_of_age_bracket_warning').addClass('hide');
                    });
                }
            }
        });
    }

    $('#referral-interventions-select').change(function () {
        var intervention = $(this).find(":selected");
        var currentClientAge = $('#current_client_age').val();
        var isAgeRestricted = intervention.attr('is_age_restricted');
        if (eval(isAgeRestricted) && (currentClientAge < intervention.attr("min_age") || currentClientAge > intervention.attr("max_age"))) {
            $('#div_referral_out_of_age_bracket_warning').fadeIn('fast');
            $('#div_referral_out_of_age_bracket_warning').removeClass('hide');
        } else {
            if (!$('#div_referral_out_of_age_bracket_warning').hasClass("hide")) {
                $('#div_referral_out_of_age_bracket_warning').fadeOut('fast', function () {
                    $('#div_referral_out_of_age_bracket_warning').addClass('hide');
                });
            }
        }
    });

    $('input#date-of-completion').change(function() {
        var completionDate = $(this).val();
        var referralDate = $('input[type=hidden]#client_referral_date').val();
        if (completionDate) {
            var formattedCompletionDate = new Date(parseInt(completionDate.split('/')[2]), 
                                                    parseInt(completionDate.split('/')[0]) - 1, 
                                                    parseInt(completionDate.split('/')[1]));
            var formattedReferralDate 
            if (referralDate)
            {
                formattedReferralDate = new Date(parseInt(referralDate.split('/')[2]), 
                                                        parseInt(referralDate.split('/')[0]) - 1, 
                                                        parseInt(referralDate.split('/')[1]));
            }
            if (formattedCompletionDate < formattedReferralDate) {
                $('#div-date-before-referral-date').fadeIn('fast');
                $('#div-date-before-referral-date').removeClass('hide');
            } else {
                $('#div-date-before-referral-date').fadeOut('fast', function () {
                    $('#div-date-before-referral-date').addClass('hide');
                });
            }
        }
    });

    function showSection(show, elementId) {
        if (show)
            $(elementId).removeClass('hidden');
        else
            $(elementId).addClass('hidden');
    }

    $('#date-of-completion').change(function () {
        var selected_date_string = $('#date-of-completion').val();
        if (selected_date_string == null || selected_date_string == "")
            return "";
        var split_date_string_array = selected_date_string.split('/');
        var formatted_date_string = split_date_string_array[2] + "-" + split_date_string_array[0] + "-" + split_date_string_array[1];
        $('#date-of-completion-formatted').val(formatted_date_string);
    });

    function validateInterventionEntryForm(intervention_code) {
        var validation_errors_array = $.merge([], validateInterventionType(intervention_code));
        validation_errors_array = $.merge(validation_errors_array, validateDateField());
        //  hts result
        if (currentInterventionType_Global.fields.has_hts_result == true)
            validation_errors_array = $.merge(validation_errors_array, validateSelectOption('HTS Test Result option ', "#hts-result-select"));

        //  pregnancy test
        if (currentInterventionType_Global.fields.has_pregnancy_result == true)
            validation_errors_array = $.merge(validation_errors_array, validateSelectOption('Pregnancy Test Result option ', "#pregnancy-result-select"));

        // ccc number
        if (currentInterventionType_Global.fields.has_ccc_number == true)
            validation_errors_array = $.merge(validation_errors_array, validateTextInput('CCC Number ', "#ccc-number"));

        // number of sessions
        if (currentInterventionType_Global.fields.has_no_of_sessions == true)
            validation_errors_array = $.merge(validation_errors_array, validateTextInput('Number of Sessions attended ', "#number-of-ss-sessions-attended"));

        if (validation_errors_array.length > 0) {
            $('#error-space').html("");
            var textMessage = "";
            $.each(validation_errors_array, function (index, err_messages) {
                textMessage += "* " + err_messages + "</br>"
            });
            $('#error-space').html(textMessage);
            return false;
        }
        return true;
    }

    function validateInterventionType(intervention_code) {
        intervention_code = intervention_code ? intervention_code : $('#intervention-type-select').val();

        if (intervention_code == null || intervention_code == 0)
                return ["Intervention Type is Invalid or NOT Selected"];

        if (!intervention_code) {
            $.each(interventionTypes, function (index, objectVal) {
                if (objectVal.fields.code == intervention_code) {
                    currentInterventionType_Global = objectVal;
                    return false;
                }
            });
        }

        return [];
    }

    function validateDateField() {
        var selected_date_string = $('#date-of-completion').val();

        if (selected_date_string == null || selected_date_string == "")
            return ["Intervention Date not Entered"];
        var split_date_string_array = selected_date_string.split('/');
        var selected_date_object = new Date(parseInt(split_date_string_array[2]), parseInt(split_date_string_array[0]) - 1, parseInt(split_date_string_array[1]));
        if (selected_date_object > new Date())
            return ["Intervention Date cannot be later than Today"];

        return [];
    }

    function setDateField(dateVal) {
        $('#date-of-completion-formatted').val(dateVal);
        var split_date_string_array = dateVal.split('-');
        $('#date-of-completion').val(split_date_string_array[1] + "/" + parseInt(split_date_string_array[2]) + "/" + parseInt(split_date_string_array[0]));
    }

    function validateSelectOption(labelData, selectInputId) {
        var option_val = $(selectInputId).val();
        if (option_val == null || option_val == 0 || option_val == "")
            return [labelData + " is required"];

        return [];
    }

    function validateTextInput(labelData, textInputId) {
        var option_val = $(textInputId).val();
        if (option_val == null || option_val == "")
            return [labelData + " is required"];

        return [];
    }

    function returnValorEmpty(doCheck, val) {
        return val != null && doCheck ? val : '';
    }

    function addUserActions(permissions) {
        if (permissions == null) {
            return "<td></td>";
        }

        var can_change_intervention = permissions.can_change_intervention;
        var can_delete_intervention = permissions.can_delete_intervention;
        var client_is_exited = permissions.client_is_exited;

        if (client_is_exited) {
            if (can_change_intervention && can_delete_intervention) {
                return "<td><span class='glyphicon glyphicon-pencil edit_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden' style='display: none'> Edit</span> &nbsp;&nbsp; <span class='glyphicon glyphicon-trash delete_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden' style='display: none'> Delete</span> </td>";
            } else if (can_change_intervention) {
                return "<td><span class='glyphicon glyphicon-pencil edit_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden' style='display: none'> Edit</span> </td>";
            } else if (can_delete_intervention) {
                return "<td><span class='glyphicon glyphicon-trash delete_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden' style='display: none'> Delete</span> </td>";
            } else {
                return "";
            }
        } else {
            if (can_change_intervention && can_delete_intervention) {
                return "<td> <span class='glyphicon glyphicon-pencil edit_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden' > Edit</span> &nbsp;&nbsp; <span class='glyphicon glyphicon-trash delete_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden'> Delete</span> </td>";
            } else if (can_change_intervention) {
                return "<td> <span class='glyphicon glyphicon-pencil edit_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden' > Edit</span> </td>";
            } else if (can_delete_intervention) {
                return "<td> <span class='glyphicon glyphicon-trash delete_intervention_click exit_unexit_toggle' arial-label='Arial-Hidden'> Delete</span> </td>";
            } else {
                return "";
            }
        }
    }

    function insertInterventionEntryInView(table_id, iv, iv_type, intervention_category_code, hts_result, pregnancy_result, top, permissions) {
        var tabpanel_id = '#behavioural-interventions';
        switch (intervention_category_code) {
            case 1001:
                if (!top)
                    $(table_id).append("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                else
                    $(table_id).prepend("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                break;
            case 2001:
                if (!top)
                    $(table_id).append("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='test_result'> " + hts_result + pregnancy_result + "</td><td class='client_ccc_number'> " + iv.fields.client_ccc_number + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                else
                    $(table_id).prepend("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='test_result'> " + hts_result + pregnancy_result + "</td><td class='client_ccc_number'> " + iv.fields.client_ccc_number + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                tabpanel_id = '#biomedical-interventions';
                break;
            case 3001:
                if (!top)
                    $(table_id).append("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                else
                    $(table_id).prepend("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                tabpanel_id = '#post-gbv-care';
                break;
            case 4001:
                if (!top)
                    $(table_id).append("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                else
                    $(table_id).prepend("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='comment'>" + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                tabpanel_id = '#social-protection';
                break;
            case 5001:
                if (!top)
                    $(table_id).append("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.get_name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='no_of_sessions_attended'> " + iv.fields.no_of_sessions_attended + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                else
                    $(table_id).prepend("<tr id='intervention_" + iv.pk + "'><td class='name'>" + iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified) + "</td><td class='intervention_date'>" + iv.fields.intervention_date + "</td><td class='no_of_sessions_attended'> " + iv.fields.no_of_sessions_attended + "</td><td class='comment'> " + iv.fields.comment + "</td>" + addUserActions(permissions) + "</tr>");
                tabpanel_id = '#other-interventions';
                break;

        }

        if ($(table_id + '  tbody  tr').length > 0)
            $(tabpanel_id + ' .message-view').addClass('hidden');
        setInterventionActionHandler(iv, iv_type, intervention_category_code);
    }

    function setInterventionActionHandler(iv, iv_type, intervention_category_code) {
        $('#intervention_' + iv.pk + ' .edit_intervention_click').click(function (event) {
            modalMode = 'edit';
            currentInterventionCategoryCode_Global = intervention_category_code;
            currentInterventionType = iv_type;
            intervention = iv;
            $('#intervention-modal').modal('show');
        });

        $('#intervention_' + iv.pk + ' .delete_intervention_click').click(function (event) {
            $('#confirm-delete-mordal').modal('show');
            currentInterventionCategoryCode_Global = intervention_category_code;
            interventionTypes = [iv_type];
            intervention = iv;
            $('#intervention_delete_id').val(intervention.pk);
        });
    }

    $('#intervention-type-select').change(function () {
        var currentInterventionTypeCode = $(this).val();
        var interventionTypeEmpty = false;

        $.each(interventionTypes, function (index, type) {
            if (currentInterventionTypeCode == type.fields.code) {
                // Check if there's need to show specify field
                showSection(type.fields.is_specified, '#other_specify_section');
                // Date
                showSection(true, '#intervention_date_section');
                showSection(type.fields.has_hts_result, '#hts_result_section');
                // ccc number
                showSection(type.fields.has_ccc_number, '#ccc_number_section');
                // pregnancy
                showSection(type.fields.has_pregnancy_result, '#pregnancy_test_section');
                // number of sessions
                showSection(type.fields.has_no_of_sessions, '#no_of_sessions_section');
                // notes
                showSection(true, '#notes_section');
                interventionTypeEmpty = true;
                // external organization section
                showSection(true, '#external_organization_section');

                currentInterventionType_Global = type;
                return false;
            }
        });

        if (interventionTypeEmpty == false) {
            showSection(false, '#other_specify_section');
            showSection(false, '#intervention_date_section');
            showSection(false, '#hts_result_section');
            showSection(false, '#ccc_number_section');
            showSection(false, '#pregnancy_test_section');
            showSection(false, '#no_of_sessions_section');
            showSection(false, '#notes_section');
        }
    });

    function prePopulateInterventionModal(iv, iv_type) {
        $('#intervention-type-select').val(iv_type.fields.code).change();
        setDateField(iv.fields.intervention_date);
        if (iv_type.fields.is_specified)
            $('#other_specify').val(iv.fields.name_specified);
        // hts result
        if (iv_type.fields.has_hts_result)
            $('#hts-result-select').val(iv.fields.hts_result);
        // ccc number
        if (iv_type.fields.has_ccc_number)
            $('#ccc_number').val(iv.fields.client_ccc_number);
        // pregnancy
        if (iv_type.fields.has_pregnancy_result)
            $('#pregnancy-result-select').val(iv.fields.pregnancy_test_result);
        // number of sessions
        if (iv_type.fields.has_no_of_sessions)
            $('#number-of-ss-sessions-attended').val(iv.fields.no_of_sessions_attended);
        // notes
        $('#comments-text').val(iv.fields.comment);

        if (iv.fields.external_organisation) {
            $('#external-organization-checkbox').prop('checked', true);
            $('fieldset#external_organization_more_section').removeClass('hidden');
            $('#external-organization-select').val(iv.fields.external_organisation);

            if (iv.fields.external_organisation_other) {
                $('div#other_external_organization').show();
                $('#other-external-organization').val(iv.fields.external_organisation_other);
            } else {
                $('div#other_external_organization').hide();
                $('#other-external-organization').val('');
            }
        } else {
            $('#external-organization-checkbox').prop('checked', false);
            $('fieldset#external_organization_more_section').addClass('hidden');
        }
    }

    $('#follow-up-modal').on('show.bs.modal', function (e) {
        createDatePicker("input#follow_up_date", '+0Y +0M +0D', new Date(2015, 9, 1));
        $('select#follow_up_type').val($("select#follow_up_type option:first").val());
        $('select#follow_up_result_type').val($("select#follow_up_result_type option:first").val());
        $('input#follow_up_date').val('');
        $('textarea#follow_up_comments').val('');
    });

    $('#edit-follow-up-modal').on('show.bs.modal', function (e) {
        createDatePicker("input#edit_follow_up_date", '+0Y +0M +0D', new Date(2015, 9, 1));
    });

    $('#follow-up-entry-form').submit(function (event) {
        $("#follow-up-entry-form #follow_up_type_warning label").addClass('hidden');
        $("#follow-up-entry-form #follow_up_result_warning").addClass('hidden');
        $("#follow-up-entry-form #follow_up_date_warning").addClass('hidden');

        var followUpType = $('#follow-up-entry-form #follow_up_type option:selected').val();
        var followUpResultType = $('#follow-up-entry-form #follow_up_result_type').val();
        var followUpDate = $('#follow-up-entry-form #follow_up_date').val();

        if (!followUpType) {
            $("#follow-up-entry-form #follow_up_type_warning").removeClass('hidden');
            $("#follow-up-entry-form #follow_up_type_warning").text('Please select follow up type');
            return false;
        } else {
            $("#follow-up-entry-form #follow_up_type_warning").addClass('hidden');
            $("#follow-up-entry-form #follow_up_type_warning").text('');
        }

        if (!followUpResultType) {
            $("#follow-up-entry-form #follow_up_result_warning").removeClass('hidden');
            $("#follow-up-entry-form #follow_up_result_warning").text('Please select follow up result');
            return false;
        } else {
            $("#follow-up-entry-form #follow_up_result_warning").addClass('hidden');
            $("#follow-up-entry-form #follow_up_result_warning").text('');
        }

        if (!followUpDate) {
            $("#follow-up-entry-form #follow_up_date_warning").removeClass('hidden');
            $("#follow-up-entry-form #follow_up_date_warning").text('Please select follow up date');
            return false;
        } else {
            $("#follow-up-entry-form #follow_up_date_warning").addClass('hidden');
            $("#follow-up-entry-form #follow_up_date_warning").text('');
        }

        $('button#btn_save_follow_up').attr('disabled', 'disabled');
        $('#follow-up-entry-form .processing-indicator').removeClass('hidden');
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/addFollowUp',
            type: "POST",
            dataType: 'json',
            data: $('#follow-up-entry-form').serialize(),
            success: function (data) {
                var status = data.status;
                var message = data.message;
                if (status == 'success') {
                    $('#client_follow_ups_alert').removeClass('hidden').addClass('alert-success')
                        .text(message)
                        .trigger('madeVisible');
                    window.location.reload()
                } else {
                    $('#client_follow_ups_alert').removeClass('hidden').addClass('alert-danger')
                    .text(message)
                    .trigger('madeVisible');
                    $('#follow-up-entry-form #error-space').html("* " + message);
                }
            }, error: function (xhr, errmsg, err) {
                $('#client_follow_ups_alert').removeClass('hidden').addClass('alert-danger')
                    .text('An error occurred while processing client details. Contact system administrator if this persists.')
                    .trigger('madeVisible');
                $('#follow-up-entry-form #error-space').html("* An error occurred while processing client details. Contact system administrator if this persists.");
            }
        });

        $('button#btn_save_follow_up').removeAttr("disabled");
        $('#follow-up-entry-form .processing-indicator').addClass('hidden');
        event.preventDefault();
        event.stopPropagation();
    });

    $('#intervention-entry-form').submit(function (event) {
        event.preventDefault();
        $('#btn_save_intervention').attr("disabled", "disabled");
        $('#intervention-entry-form .processing-indicator').removeClass('hidden');
        var intervention_category_code = currentInterventionCategoryCode_Global;
        var table_id = "#interventions_" + intervention_category_code + "_table";

        if (intervention_category_code == null || intervention_category_code == "" || table_id == null || table_id == "") {
            $('#btn_save_intervention').removeAttr("disabled");
            $('#intervention-entry-form .processing-indicator').addClass('hidden');
            return false;
        }

        if (!validateInterventionEntryForm(null)) {
            $('#btn_save_intervention').removeAttr("disabled");
            $('#intervention-entry-form .processing-indicator').addClass('hidden');
            return false;
        }

        var postUrl = modalMode == "edit" ? "/ivUpdate" : "/ivSave";
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: postUrl,
            type: "POST",
            dataType: 'json',
            data: $('#intervention-entry-form').serialize(),
            success: function (data) {
                var status = data.status;
                var message = data.message;
                var alert_id = '#action_alert_' + currentInterventionCategoryCode_Global;
                if (status == 'fail') {
                    $(alert_id).removeClass('hidden').addClass('alert-danger')
                        .text(message)
                        .trigger('madeVisible');
                    $("#intervention-modal").each(function () {
                        this.reset;
                    });

                    $('#btn_save_intervention').removeAttr("disabled");
                    $('#intervention-entry-form .processing-indicator').addClass('hidden');
                    $('#intervention-entry-form #error-space').html("* " + message);
                }
                else {
                    var iv = $.parseJSON(data.intervention)[0];
                    var iv_type = $.parseJSON(data.i_type)[0];
                    var hts_results = $.parseJSON(data.hts_results);
                    var pregnancy_results = $.parseJSON(data.pregnancy_results);
                    var permissions = $.parseJSON(data.permissions);
                    var hts_result = iv_type.fields.has_hts_result ? getResultName(hts_results, iv_type.fields.has_hts_result, iv.fields.hts_result) : "";
                    var pregnancy_result = iv_type.fields.has_pregnancy_result ? getResultName(pregnancy_results, iv_type.fields.has_pregnancy_result, iv.fields.pregnancy_test_result) : "";

                    iv.fields.client_ccc_number = iv.fields.client_ccc_number == null ? "" : iv.fields.client_ccc_number;
                    iv.fields.no_of_sessions_attended = iv.fields.no_of_sessions_attended == null ? "" : iv.fields.no_of_sessions_attended;
                    if (modalMode == "new") {
                        if (data.is_editable_by_ip[iv.pk] == false || data.client_is_exited[iv.pk] == false) {
                            permissions = null;
                        }

                        insertInterventionEntryInView(table_id, iv, iv_type, intervention_category_code, hts_result, pregnancy_result, true, permissions);
                        $(table_id + ' tr.zero_message_row').remove();
                        $(alert_id).removeClass('hidden').addClass('alert-success')
                            .text('Intervention has been Saved successfully!')
                            .trigger('madeVisible')
                    }
                    else if (modalMode == "edit") {
                        var row_id = 'intervention_' + iv.pk;
                        $('#' + row_id + ' .intervention_date').text(iv.fields.intervention_date);
                        // Specified name
                        $('#' + row_id + ' .name').text(iv_type.fields.name + " " + returnValorEmpty(iv_type.fields.is_specified, iv.fields.name_specified));

                        if (iv_type.fields.has_hts_result)
                            $('#' + row_id + ' .test_result').text(hts_result);
                        // ccc number
                        if (iv_type.fields.has_ccc_number)
                            $('#' + row_id + ' .client_ccc_number').text(iv.fields.client_ccc_number);
                        // pregnancy
                        if (iv_type.fields.has_pregnancy_result)
                            $('#' + row_id + ' .test_result').text(pregnancy_result);
                        // number of sessions
                        if (iv_type.fields.has_no_of_sessions)
                            $('#' + row_id + ' .no_of_sessions_attended').text(iv.fields.no_of_sessions_attended);
                        // notes
                        $('#' + row_id + ' .comment').text(iv.fields.comment);

                        setInterventionActionHandler(iv, iv_type, intervention_category_code);
                        $(alert_id).removeClass('hidden').addClass('alert-success').text('Intervention has been Updated successfully!');
                    }

                    $("#intervention-modal").each(function () {
                        this.reset;
                    });
                    $('#btn_save_intervention').removeAttr("disabled");
                    $('#intervention-entry-form .processing-indicator').addClass('hidden');
                    $('#intervention-modal').modal('hide');
                }
            },

            error: function (xhr, errmsg, err) {
                $('#action_alert_' + currentInterventionCategoryCode_Global).removeClass('hidden').addClass('alert-danger').text('An error occurred. Please try again: ' + errmsg);
                $('#btn_save_intervention').removeAttr("disabled");
                console.log(xhr.status + " " + err + ": " + xhr.responseText);
                $('#intervention-entry-form .processing-indicator').addClass('hidden');
                $('#intervention-entry-form #error-space').html("* " + message);
            }
        });
    });

    $('.dp-action-alert').on('madeVisible', function (event) {
        var alert_space = $(event.target);
        var timeout = alert_space.hasClass('alert-danger') ? 15000 : 5000;
        setTimeout(function () {
            alert_space.removeClass('alert-success').removeClass('alert-danger')
                .addClass('hidden')
                .text("")
        }, timeout);
    });

    $('tr').on('rowChangeMade', function (event) {
        var tr = $(this).addClass('success');
        setTimeout(function () {
            tr.removeClass('success');
        }, 5000);
    });

    $('#user_credentials_alert').on('madeVisible_logout', function (event) {
        setTimeout(function () {
            var alert_space = $(event.target);
            alert_space.removeClass('alert-success').removeClass('alert-danger')
                .addClass('hidden')
                .text("");
            window.location.href = "/logout";
        }, 1000);
    });

    $('button.edit-follow-up').click(function(event) {
        var follow_up_id = $(this).attr('data-follow_up_id');
        var follow_up_name = $(this).attr('data-follow-up-name');
        var follow_up_result = $(this).attr('data-follow-up-result');
        var follow_up_date = $(this).attr('data-follow-up-date');
        var follow_up_comments = $(this).attr('data-follow-up-comments');

        $('form#edit-follow-up-entry-form input[type=hidden]#follow_up_id').val(follow_up_id);
        $('form#edit-follow-up-entry-form select#follow_up_type option').each(function () {
            if ($(this).text() == follow_up_name) {
                $(this).prop("selected", true);
            }
        });

        $('form#edit-follow-up-entry-form select#follow_up_result_type option').each(function () {
            if ($(this).text() == follow_up_result) {
                $(this).prop("selected", true);
            }
        });

        $('form#edit-follow-up-entry-form input#edit_follow_up_date').val(follow_up_date);
        $('form#edit-follow-up-entry-form textarea#follow_up_comments').text(follow_up_comments);
        $('#edit-follow-up-modal').show();
    });

    $('button.confirm-follow-up-delete').click(function(event) {
        var follow_up_id = $(this).attr('data-follow_up_id');
       $('input[type=hidden]#follow_up_id').val(follow_up_id);
    });

    $('#btn_edit_follow_up').click(function (event) {
        $("#edit-follow-up-entry-form #follow_up_type_warning label").addClass('hidden');
        $("#edit-follow-up-entry-form #follow_up_result_type_warning").addClass('hidden');
        $("#edit-follow-up-entry-form #edit_follow_up_date_warning").addClass('hidden');

        var followUpType = $('#edit-follow-up-entry-form #follow_up_type option:selected').val();
        var followUpResultType = $('#edit-follow-up-entry-form #follow_up_result_type').val();
        var followUpDate = $('#edit-follow-up-entry-form #edit_follow_up_date').val();

        if (!followUpType) {
            $("#edit-follow-up-entry-form #follow_up_type_warning").removeClass('hidden');
            $("#edit-follow-up-entry-form #follow_up_type_warning").text('Please select follow up type');
            return false;
        } else {
            $("#edit-follow-up-entry-form #follow_up_type_warning").addClass('hidden');
            $("#edit-follow-up-entry-form #follow_up_type_warning").text('');
        }

        if (!followUpResultType) {
            $("#edit-follow-up-entry-form #follow_up_result_type_warning").removeClass('hidden');
            $("#edit-follow-up-entry-form #follow_up_result_type_warning").text('Please select follow up result');
            return false;
        } else {
            $("#edit-follow-up-entry-form #follow_up_result_type_warning").addClass('hidden');
            $("#edit-follow-up-entry-form #follow_up_result_type_warning").text('');
        }

        if (!followUpDate) {
            $("#edit-follow-up-entry-form #edit_follow_up_date_warning").removeClass('hidden');
            $("#edit-follow-up-entry-form #edit_follow_up_date_warning").text('Please select follow up date');
            return false;
        } else {
            $("#edit-follow-up-entry-form #edit_follow_up_date_warning").addClass('hidden');
            $("#edit-follow-up-entry-form #edit_follow_up_date_warning").text('');
        }

        $('button#btn_edit_follow_up').attr('disabled', 'disabled');
        $('#edit-follow-up-entry-form .processing-indicator').removeClass('hidden');

        var btn = $(event.target);
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/editFollowUp',
            type: "POST",
            dataType: 'json',
            data: $('#edit-follow-up-entry-form').serialize(),
            success: function (data) {
                var alert_id = '#action_alert_follow_ups';
                if (data.status == "success") {
                    $(alert_id).removeClass('hidden').addClass('alert-success')
                                .text('Follow Up has been updated successfully!')
                                .trigger('madeVisible');
                    $('#confirm-follow-up-delete-modal').modal('hide');
                    window.location.reload();
                }
                else {
                    $(alert_id).removeClass('hidden')
                        .addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                    $('#edit-follow-up-entry-form #error-space').html("* " + data.message);
                }

            }, error: function (xhr, errmsg, err) {
                $('#action_alert_follow_ups').removeClass('hidden')
                                                .addClass('alert-danger')
                                                .text(errmsg)
                                                .trigger('madeVisible');
                $('#edit-follow-up-entry-form #error-space').html("* An error has occured.");
            }
        });

        $('button#btn_edit_follow_up').removeAttr("disabled");
        $('#edit-follow-up-entry-form .processing-indicator').addClass('hidden');
        event.preventDefault();
        event.stopPropagation();
    });

    $('#btn_delete_follow_up_confirmation').click(function (event) {
        var btn = $(event.target);
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/deleteFollowUp',
            type: "POST",
            dataType: 'json',
            data: $('#follow_up_delete_form').serialize(),
            success: function (data) {
                var alert_id = '#action_alert_follow_ups';
                if (data.status == "success") {
                    $('tr#follow_up_' + data.follow_up_id).remove();
                    $(alert_id).removeClass('hidden').addClass('alert-success')
                                .text('Follow Up has been deleted successfully!')
                                .trigger('madeVisible');
                    var tbody_id = '#follow_ups_table_tbody';
                    if ($(tbody_id + ' tr').length < 1) {
                        var col_span = $('#follow_ups_table' + ' thead tr')[0].cells.length;
                        $(tbody_id).append("<tr class='zero_message_row'><td colspan='" + col_span + "' style='text-align: center'>No client follow ups.</td></tr>");
                    }
                }
                else {
                    $(alert_id).removeClass('hidden')
                        .addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                }
                $('#confirm-follow-up-delete-modal').modal('hide');
            }, error: function (xhr, errmsg, err) {
                $('#action_alert_follow_ups').removeClass('hidden')
                                                .addClass('alert-danger')
                                                .text(errmsg)
                                                .trigger('madeVisible');
                $('#confirm-follow-up-delete-modal').modal('hide');
            }
        });
    });

    $('#btn_delete_intervention_confirmation').click(function (event) {
        var btn = $(event.target);
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/ivDelete',
            type: "POST",
            dataType: 'json',
            data: $('#intervention_delete_form').serialize(),
            success: function (data) {
                var alert_id = '#action_alert_' + currentInterventionCategoryCode_Global;
                if (data.status == "success") {
                    $('#intervention_' + data.intervention_id).remove();
                    $(alert_id).removeClass('hidden').addClass('alert-success')
                        .text('Intervention has been deleted successfully!')
                        .trigger('madeVisible');
                    var tbody_id = '#interventions_' + currentInterventionCategoryCode_Global + '_tbody';
                    if ($(tbody_id + ' tr').length < 1) {
                        var col_span = $('#interventions_' + currentInterventionCategoryCode_Global + '_table' + ' thead tr')[0].cells.length;
                        $(tbody_id).append("<tr class='zero_message_row'><td colspan='" + col_span + "' style='text-align: center'>0 Interventions</td></tr>");
                    }
                }
                else
                    $(alert_id).removeClass('hidden')
                        .addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                $('#confirm-delete-mordal').modal('hide');
            },

            error: function (xhr, errmsg, err) {
                $('#action_alert_' + currentInterventionCategoryCode_Global).removeClass('hidden')
                    .addClass('alert-danger')
                    .text(errmsg)
                    .trigger('madeVisible');
                $('#confirm-delete-mordal').modal('hide');
            }
        });
    });

    function validateClientForm(clientForm) {
        var errors = 0;

        clientForm.find('.validate_field').each(function (index, field) {
            $('#spn_' + $(field).attr('id')).addClass('hidden');
        });

        clientForm.find('.required_field').each(function (index, field) {
            if ($(field).val() == null || $(field).val() == '') {
                var spanId = '#spn_' + $(field).attr('id');
                $(spanId).html('&nbsp; &#42; Required')
                    .css('color', 'red')
                    .removeClass('hidden');
                errors++;
            }
        });

        clientForm.find('.phone_number_field').each(function (index, field) {
            var phone_number = $(field).val();
            if (phone_number != null && phone_number != '') {
                var filter = /^((\+[1-9]{1,4}[ \-]*)|(\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/;
                if (!filter.test(phone_number)) {
                    var spanId = '#spn_' + $(field).attr('id');
                    $(spanId).html('&nbsp; &#42; Invalid Phone Number')
                        .css('color', 'red')
                        .removeClass('hidden');
                    errors++;
                }
            }
        });

        return errors < 1;
    }

    $('.format_date_event').change(function (event) {
        var target = $(event.target);
        var target_id = '#' + target.attr('id');
        var formatted_target_id = target_id + '_formatted';
        var selected_date_string = $(target_id).val();

        if (selected_date_string == null || selected_date_string == "")
            return;

        var split_date_string_array = selected_date_string.split('/');
        var formatted_date_string = split_date_string_array[2] + "-" + split_date_string_array[0] + "-" + split_date_string_array[1]
        $(formatted_target_id).val(formatted_date_string);
    });

    function deleteClient(client_id) {
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: '/clientDelete',
            type: "GET",
            dataType: 'json',
            data: {'client_id': client_id},
            success: function (data) {
                var result = $.parseJSON(data);
                if (result.status == "success") {
                    $('#clients_row_' + client_id).remove();
                    $('#client_actions_alert').removeClass('hidden').addClass('alert-success')
                        .text(result.message)
                        .trigger('madeVisible');

                    if ($('#dp-patient-list-body tr').length < 1) {
                        $('#dp-patient-list-body').append("<tr><td colspan='4' style='text-align: center'>0 Clients</td></tr>");
                    }
                }
                else {
                    $('#client_actions_alert').removeClass('hidden').addClass('alert-danger')
                        .text(result.message)
                        .trigger('madeVisible')
                }
                $('#confirmationModal').modal('hide');
            },

            error: function (xhr, errmsg, err) {
                $('#confirmationModal').modal('hide');
                $('#alert_enrollment').removeClass('hidden').addClass('alert-danger')
                    .text('An error occurred while deleting client. Contact system administratior if this persists')
                    .trigger('madeVisible')
            }
        });
    }

    $('#enrollment-modal').on('shown.bs.modal', function (e) {
        var button = $(e.relatedTarget);
        var client_id = button.data('client_id');
        var view_mode = button.data('view_mode');
        if (client_id != null && client_id != 0) {
            var csrftoken = getCookie('csrftoken');

            $.ajax({
                url: '/clientEdit',
                type: "GET",
                dataType: 'json',
                data: {'client_id': client_id},
                success: function (response_data) {
                    var response = JSON.parse(response_data.client);
                    var client = response[0];

                    if (view_mode == 'view')
                        $('#enrollment-form :input').attr('disabled', true);
                    else
                        $('#enrollment-form :input').attr('disabled', false);
                    $('#enrollment-form #btn_hide_enrollment').attr('disabled', false);
                    $('#enrollment-form #close__enrollment_modal').attr('disabled', false);

                    $('#enrollment-form #client_id').val(client.pk);
                    $.each(client.fields, function (index, field) {
                        $('#enrollment-form #' + index).val(field);
                    });

                    // set IP values
                    $('#implementing_partner option').each(function () {
                        if ($(this).data('ip_id') == client.fields.implementing_partner) {
                            $(this).prop("selected", true);
                        }
                    });

                    // Set Verification document values
                    $('#verification_document option').each(function () {
                        if ($(this).data('verification_document_id') == client.fields.verification_document) {
                            $(this).prop("selected", true);
                        }
                    });

                    // Set Marital status values
                    $('#marital_status option').each(function () {
                        if ($(this).data('marital_status_id') == client.fields.marital_status) {
                            $(this).prop("selected", true);
                        }
                    });

                    // Set County values
                    $('#county_of_residence option').each(function () {
                        if ($(this).data('county_of_residence_id') == client.fields.county_of_residence) {
                            $(this).prop("selected", true);
                        }
                    });

                    // Set OVC
                    $('#external_organisation option').each(function () {
                        if ($(this).data('external_organisation') == client.fields.external_organisation) {
                            $(this).prop("selected", true);
                        }
                    });

                    getSubCounties(true, $('#county_of_residence').val(), client.fields.sub_county, client.fields.ward)
                },

                error: function (xhr, errmsg, err) {
                    $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                        " <a href='#' class='close'>&times;</a></div>");
                    console.log(xhr.status + ": " + xhr.responseText);
                }
            });
        }
        else {
            return;
        }
    });

    $('#enrollment-modal').on('hide.bs.modal', function (e) {
        $('#enrollment-form .clear_value').val('');
        $('#enrollment-form .clear_span').html('');
        $('#enrollment-form .clear_true').prop('checked', false);
    });

    $('#enrollment-form').submit(function (event) {
        event.preventDefault();
        $('#btn_hide_enrollment').attr("disabled", true);
        $('#btn_save_enrollment').attr("disabled", true);
        $('#id_implementing_partner').val($('#temp_current_ip').val());

        if (!$('#enrollment-form').valid()) {
            $('#btn_hide_enrollment').attr("disabled", false);
            $('#btn_save_enrollment').attr("disabled", false);
            return;
        }

        var enrollment_form_submit_mode = 'new';
        var post_url = '/clientSave';
        var clientForm = $(event.target);
        if (!validateClientForm(clientForm)) {
            $('#btn_hide_enrollment').attr("disabled", false);
            $('#btn_save_enrollment').attr("disabled", false);
            return;
        }

        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: post_url,
            type: "POST",
            dataType: 'json',
            data: $('#enrollment-form').serialize(),
        }).done(function (data, textStatus, jqXHR) {
            var result = $.parseJSON(data)
            if (result.status == "success") {
                var clients_tbody = $('#dp-patient-list-body');
                var date_of_enrollment = new Date($('#enrollment-form #date_of_enrollment').val());
                date_of_enrollment = $.datepicker.formatDate('MM d, yy', date_of_enrollment);

                $('#client_actions_alert').removeClass('hidden').addClass('alert-success')
                    .text(result.message)
                    .trigger('madeVisible');
                window.location = '/client_baseline_info?client_id=' + result.client_id + '&search_client_term=';
                $("#enrollment-modal").modal('hide');
            }
            else {
                $('#client_actions_alert').removeClass('hidden').addClass('alert-danger')
                    .text(result.message)
                    .trigger('madeVisible');

                $('#enrolment_actions_alert').removeClass('hidden').addClass('alert-danger')
                    .text(result.message)
                    .trigger('madeVisible');
            }
        }).fail(function (xhr, errmsg, err) {
            $('#alert_enrollment').removeClass('hidden').addClass('alert-danger')
                .text('An error occurred while processing client details. Contact system administrator if this persists.')
                .trigger('madeVisible')
        }).always(function () {
            $('#btn_hide_enrollment').removeAttr("disabled");
            $('#btn_save_enrollment').removeAttr("disabled");
        });
    });

    $('#btn_hide_enrollment').click(function (event) {
        $('#enrollment-modal').modal('toggle');
    });

    $('#county_filter').change(function (event) {
        getSubCountiesFilter(false, null, null, null);
    });

    function getSubCountiesFilter(setSelected, c_code, sub_county_id, ward_id) {
        var county_id = setSelected == true ? c_code : $('#county_filter').val();
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: "/getSubCounties",
            type: "GET",
            dataType: 'json',
            data: {
                county_id: county_id,
            },
            success: function (data) {
                var sub_counties = $.parseJSON(data.sub_counties);
                $("#sub_county_filter option").remove();
                $("#sub_county_filter").append("<option value=''>Select Sub-County</option>");
                $.each(sub_counties, function (index, field) {
                    $("#sub_county_filter").append("<option data-sub_county_id='" + field.pk + "' value='" + field.pk + "'>" + field.fields.name + "</option>");
                });

                if (setSelected) {
                    $('#sub_county_filter option').each(function () {
                        if (sub_county_id != null && $(this).data('sub_county_id') == sub_county_id) {
                            $(this).prop("selected", true);
                            getWardsFilter(true, $(this).val(), ward_id)
                        }
                    });
                }
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    $('#sub_county_filter').change(function (event) {
        getWardsFilter(false, null, null);
    });

    function getWardsFilter(setSelected, sc_id, ward_id) {
        var sc_id = setSelected ? sc_id : $('#sub_county_filter').val();
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: "/getWards",
            type: "GET",
            dataType: 'json',
            data: {
                sub_county_id: sc_id,
            },
            success: function (data) {
                var wards = $.parseJSON(data.wards);
                $("#ward_filter option").remove();
                $("#ward_filter").append("<option value=''>Select Ward</option>");
                $.each(wards, function (index, field) {
                    $("#ward_filter").append("<option data-ward_id='" + field.pk + "' value='" + field.pk + "'>" + field.fields.name + "</option>");
                });

                if (setSelected) {
                    $('#ward_filter option').each(function () {
                        if (ward_id != null && $(this).data('ward_id') == ward_id) {
                            $(this).prop("selected", true);
                        }
                    });
                }
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    $('#id_county_of_residence').change(function (event) {
        getSubCounties(false, null, null, null);
    });

    function getSubCounties(setSelected, c_code, sub_county_id, ward_id) {
        var county_id = setSelected == true ? c_code : $('#id_county_of_residence').val();
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: "/getSubCounties",
            type: "GET",
            dataType: 'json',
            data: {
                county_id: county_id,
            },
            success: function (data) {
                var sub_counties = $.parseJSON(data.sub_counties);
                $("#id_sub_county option").remove();
                $("#id_sub_county").append("<option value=''>Select Sub-County</option>");
                $.each(sub_counties, function (index, field) {
                    $("#id_sub_county").append("<option data-sub_county_id='" + field.pk + "' value='" + field.pk + "'>" + field.fields.name + "</option>");
                });

                if (setSelected) {
                    $('#id_sub_county option').each(function () {
                        if (sub_county_id != null && $(this).data('sub_county_id') == sub_county_id) {
                            $(this).prop("selected", true);
                            getWards(true, $(this).val(), ward_id);
                        }
                    });
                }
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    $('#id_sub_county').change(function (event) {
        getWards(false, null, null);
    });

    function getWards(setSelected, sc_id, ward_id) {
        var sc_id = setSelected ? sc_id : $('#id_sub_county').val();
        var csrftoken = getCookie('csrftoken');
        $.ajax({
            url: "/getWards",
            type: "GET",
            dataType: 'json',
            data: {
                sub_county_id: sc_id,
            },
            success: function (data) {
                var wards = $.parseJSON(data.wards);
                $("#id_ward option").remove();
                $("#id_ward").append("<option value=''>Select Ward</option>");
                $.each(wards, function (index, field) {
                    $("#id_ward").append("<option data-ward_id='" + field.pk + "' value='" + field.pk + "'>" + field.fields.name + "</option>");
                });

                if (setSelected) {
                    $('#id_ward option').each(function () {
                        if (ward_id != null && $(this).data('ward_id') == ward_id) {
                            $(this).prop("selected", true);
                        }
                    });
                }
            },

            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
            }
        });
    }

    $('a[data-confirm-client-delete]').click(function (event) {
        var clientId = $(this).data('client_id');
        $('#confirmationModal #frm_title').html('Confirm Client Delete Action');
        $('#confirmationModal #frm_body > h4').html('Are you sure you want to delete this client? Changes cannot be undone.');
        $('#confirmationModal').modal({show: true});

        $('#confirmationModal #dataConfirmOK').click(function (event) {
            deleteClient(clientId);
        });
    });

    $('#audit-log-clear-filtes').click(function (event) {
        $('#filter-log-text').val('');
        $('#filter-log-date').val('');
        $('#filter-log-date-from').val('');
        window.location.href = "/logs";
    });

    $('.user_action').click(function (event) {
        var btn = event.target;
        var u_action = $(btn).data('user_action');
        var ip_user_id = $(btn).data('ip_user_id');
        var confirm_title = "";
        var confirm_message = "";
        var active = false;
        var callback_func = null;

        switch (u_action) {
            case "deactivate_user":
                confirm_title = 'Confirm User Deactivation Action';
                confirm_message = 'Are you sure you want to Deactivate this User?';
                callback_func = toggleUserStatus;
                active = false;
                break;
            case "activate_user":
                confirm_title = 'Confirm User Activation Action';
                confirm_message = 'Are you sure you want to Activate User?';
                callback_func = toggleUserStatus;
                active = true;
                break;
            case "delete_user":
                confirm_title = 'Confirm User Delete Action';
                confirm_message = 'Are you sure you want to Delete this User? This action cannot be undone.';
                callback_func = deleteUser;
                break;
            case "delete_follow_up":
                confirm_title = "Delete Follow Up";
                confirm_message = "Are you sure you want to delete this follow up?";
                callback_func = deleteFollowUp;
            default:
                break;
        }

        $('#confirmationModal #frm_title').html(confirm_title);
        $('#confirmationModal #frm_body > h4').html(confirm_message);
        $('#confirmationModal').modal({show: true});

        $('#confirmationModal #dataConfirmOK').click(function (event) {
            callback_func(ip_user_id, active, btn);
            $(event.target).off('click');
        });
    });

    function toggleUserStatus(ip_user_id, activate, target) {
        $.ajax({
            url: '/admin/users/toggle_status',
            type: "GET",
            dataType: 'json',
            data: {
                'ip_user_id': ip_user_id,
                'toggle': activate
            },
            success: function (data) {
                if (data.status == "success") {
                    $('#user_actions_alert').removeClass('hidden').addClass('alert-success')
                        .text(data.message)
                        .trigger('madeVisible');
                    $(target).addClass('hidden');
                    $(target).siblings('.hidden').removeClass('hidden');

                    var tblData = $(target).parent().parent();
                    tblData.siblings().eq(4).html(activate ? "Active" : "Disabled");
                    tblRow = tblData.parent();
                    tblRow.trigger('rowChangeMade')
                }
                else {
                    $('#user_actions_alert').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                }
            },

            error: function (xhr, errmsg, err) {
                $('#user_actions_alert').removeClass('hidden').addClass('alert-danger')
                    .text(errmsg)
                    .trigger('madeVisible')
            }
        });

        $("#confirmationModal").modal('hide');
    }

    function deleteUser(ip_user_id, active, target) {

    }

    $("#user-entry-form").validate({
        rules: {
            reg_role: "required",
            reg_firstname: {
                required: true,
                minlength: 2
            },
            reg_lastname: {
                required: true,
                minlength: 2
            },
            reg_username: {
                required: true,
                minlength: 2
            },
            reg_email: {
                required: true,
                email: true
            }
        },
        messages: {
            reg_firstname: "* Please enter your First Name",
            reg_lastname: "* Please enter your Last Name",
            reg_username: {
                required: "* Please enter a username",
                minlength: "* Your username must consist of at least 2 characters"
            },
            reg_email: "* Please enter a valid email address"
        },
        highlight: function (element) {
            $(element).parent().find('label.error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $(element).parent().find('label.error').removeClass('text-danger')
        }
    });

    $('#reg_emailaddress').on('input', function (e) {
        $('#reg_username').val($(e.target).val().split('@')[0])
    });

    $("#user-entry-form").submit(function (e) {
        e.preventDefault();
        if (!$(e.target).valid())
            return false;

        var csrftoken = getCookie('csrftoken');
        $("#processing-user-form").removeClass('hidden');

        $.ajax({
            url: '/admin/users/save',
            type: "POST",
            dataType: 'json',
            data: $('#user-entry-form').serialize(),
            success: function (data) {
                if (data.status == "success") {
                    $("#user-modal").modal('hide');
                    window.location.href = "/admin/users";
                }
                else {
                    $('#user_actions_alert').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                    $("#user-modal").modal('hide');
                }
                $("#processing-user-form").addClass('hidden');
            },

            error: function (xhr, errmsg, err) {
                $('#user_actions_alert').removeClass('hidden').addClass('alert-danger')
                    .text('Error: ' + errmsg)
                    .trigger('madeVisible');
                $("#loading-modal").modal('hide');
                $("#processing-user-form").addClass('hidden');
            }
        });
    });

    $('#user-clear-filters').click(function (e) {
        window.location.href = "/admin/users";
    });

    $("#user_change_password_form").validate({
        rules: {
            ch_username: {
                required: true,
                minlength: 2
            },
            ch_current_password: {
                required: true,
                minlength: 2
            },
            ch_new_password: {
                required: true,
                minlength: 2
            },
            ch_confirm_new_password: {
                required: true,
                minlength: 2,
                equalTo: "#ch_new_password"
            }
        },
        messages: {
            ch_username: {
                required: "* Please enter your Username",
                minlength: "* Your username must be at least 2 characters long"
            },
            ch_current_password: {
                required: "* Please enter your current password",
                minlength: "Your current password must be at least 2 characters long"
            },
            ch_new_password: {
                required: "* Please enter your new password",
                minlength: "Your new password must be at least 2 characters long"
            },
            ch_confirm_new_password: {
                required: "* Please confirm your new password",
                equalTo: "Please enter matching new and confirmation passwords"
            }
        },
        highlight: function (element) {
            $(element).parent().addClass('text-danger')
        },
        unhighlight: function (element) {
            $(element).parent().removeClass('text-danger')
        }
    });

    $("#user_change_password_form").submit(function (event) {
        event.preventDefault();
        if (!$(event.target).valid())
            return false;

        var csrftoken = getCookie('csrftoken');
        $('#user_change_password_form .processing-indicator').removeClass('hidden');
        $('#user_change_password_form .btn-toggle-enabled').addClass('disabled');

        $.ajax({
            url: '/admin/users/change_cred',
            type: "POST",
            dataType: 'json',
            data: $('#user_change_password_form').serialize(),
            success: function (data) {
                if (data.status == "success") {
                    $('#user_credentials_alert').removeClass('hidden').addClass('alert-success')
                        .text(data.message)
                        .trigger('madeVisible_logout');
                }
                else {
                    $('#user_credentials_alert').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible_logout');
                    $("#user-modal").modal('hide');
                }
                $('#user_change_password_form .processing-indicator').addClass('hidden');
                $('#user_change_password_form .btn-toggle-enabled').removeClass('disabled');
            },

            error: function (xhr, errmsg, err) {
                $('#user_credentials_alert').removeClass('hidden').addClass('alert-danger')
                    .text('An error occurred while processing client details. Contact system administrator if this persists.')
                    .trigger('madeVisible');
                $('#user_change_password_form .processing-indicator').addClass('hidden');
                $('#user_change_password_form .btn-toggle-enabled').removeClass('disabled');
            }
        });
    });

    function getOptionName(list, id) {
        var optionName = "";
        $.each(list, function (index, item) {
            if (item.pk == id)
                optionName = item.fields.name;
        });
        return optionName;
    }

    $("#grievances-form-submit").click(function (e) {
        var viewMode = $('#grievance-modal').data('view_mode');
        if (viewMode == 'view')
            return;
        var urlT = viewMode == 'add' ? '/grievances/create' : '/grievances/edit';
        if (!$('#grievances-form').valid())
            return;

        $.ajax({
            url: urlT,
            type: "POST",
            dataType: 'json',
            data: $('#grievances-form').serialize(),
            success: function (data) {
                var grievance = data.grievance;
                var grievance_id = data.grievance_id;
                var options = {
                    'reporter_category': $.parseJSON(data.reporter_categories),
                    'grievance_nature': $.parseJSON(data.grievance_nature),
                    'status': $.parseJSON(data.status_list)
                };
                if (data.status == 'fail') {
                    $('#grievances_alert').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                }
                else {
                    if (viewMode == 'add') {
                        var row = "<tr style='cursor: pointer; background-color: transparent;' id='grievance_" + grievance_id + "'>"
                            + "<td class='date' style='width: 120px;'>" + $.datepicker.formatDate('MM dd, yy', new Date(grievance.date)) + "</td>"
                            + "<td class='grievance_nature'>" + getOptionName(options.grievance_nature, grievance.grievance_nature) + "</td>"
                            + "<td class='reporter_category'>" + getOptionName(options.reporter_category, grievance.reporter_category) + "</td>"
                            + "<td class='reporter_name'>" + grievance.reporter_name + "</td>"
                            + "<td class='reporter_phone'>" + grievance.reporter_phone + "</td>"
                            + "<td class='status'>" + getOptionName(options.status, grievance.status) + "</td>"
                            + "<td class='resolution'>" + grievance.resolution + "</td>"
                            + "<td>"
                            + "<div class='btn-group'>"
                            + "<button type='button' class='btn btn-sm btn-default grievance-action' data-view_mode='edit' data-grievance_id='" + grievance_id + "' style='cursor: pointer;' ><span class='glyphicon glyphicon-pencil'></span> Edit Grievance</button>"
                            + "<button type='button' class='btn btn-sm btn-default dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"
                            + "<span class='caret'></span>"
                            + "<span class='sr-only'>Toggle Dropdown</span>"
                            + "</button>"
                            + "<ul class='dropdown-menu'>"
                            + "<li><a href='#' class='edit_intervention_click edit_client grievance-action' data-view_mode='view' data-toggle='modal' data-target='#enrollment-modal' data-grievance_id='" + grievance_id + "' style='cursor: pointer;word-spacing: 0px !important;'><span class='glyphicon glyphicon-eye-open'></span> View Grievance </a></li>"
                            + " <li><a href='#' class='delete_intervention_click grievance-action' data-view_mode='delete' data-grievance_id='" + grievance_id + "'><span class='glyphicon glyphicon-trash'></span> Delete Grievance &nbsp;&nbsp;&nbsp;</a></li>"
                            + "</ul>"
                            + "</div>"
                            + "</td>"
                            + "</tr>";
                        $('#dreams-grievance-table').find('tbody').prepend(row);
                        $('#dreams-grievance-table #grievance_' + grievance_id + ' .grievance-action').click(function (e) {
                            var action = '';
                            var viewMode = $(this).data('view_mode');
                            var grievanceId = $(this).data('grievance_id');
                            switch (viewMode) {
                                case 'view':
                                    viewGrievance(grievanceId, true);
                                    break;
                                case 'edit':
                                    viewGrievance(grievanceId, false);
                                    break;
                                case 'delete':
                                    $('#confirmationModal #frm_title').html('Confirm Grievance Delete Action');
                                    $('#confirmationModal #frm_body > h4').html('Are you sure you want to Delete Grievance? This action cannot be undone.');
                                    $('#confirmationModal').modal({show: true});

                                    $('#confirmationModal #dataConfirmOK').click(function (event) {
                                        deleteGrievance(grievanceId);
                                        $(event.target).off('click');
                                    });
                                    break;
                                default:
                                    return;
                            }
                        });
                    }
                    else {
                        var rowId = grievance.id;
                        var row = $('#grievance_' + rowId);
                        $.each(Object.keys(grievance), function (index, key) {
                            if (row.find('.' + key) != null) {
                                if ($.inArray(key, ['grievance_nature', 'reporter_category', 'status']) > -1) {
                                    row.find('.' + key).html(getOptionName(options[key], grievance[key]));
                                }
                                else if (key == 'date')
                                    row.find('.date').html($.datepicker.formatDate('MM dd, yy', new Date(grievance.date)))
                                else
                                    row.find('.' + key).html(grievance[key]);
                            }
                        })
                    }
                    $('#grievances_alert').removeClass('hidden').addClass('alert-success')
                        .text(data.message)
                        .trigger('madeVisible');
                    $("#grievance-modal").modal('hide');
                }
            },

            error: function (xhr, errmsg, err) {
                alert("Failed " + errmsg + " " + err);
            }
        });
    });

    var createDatePicker = function (elemID, maxDate, minDate, defaultDate) {
        $(elemID).datepicker({
            beforeShow: function (input, inst) {
                $(document).off('focusin.bs.modal');
            },
            onClose: function () {
                $(document).on('focusin.bs.modal');
            },
            maxDate: maxDate,
            minDate: minDate,
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true,
            defaultDate: defaultDate
        });
    };

    createDatePicker("#doe_start_filter", '0y 0m 0d', new Date(2015, 9, 1));
    createDatePicker("#filter-log-date", '0');
    createDatePicker("#to_intervention_date", '0y 0m 0d', (new Date(2015, 9, 1)));
    createDatePicker("#filter-log-date-from", '0');
    createDatePicker("#from_intervention_date", '0y 0m 0d', (new Date(2015, 9, 1)));
    createDatePicker("#doe_end_filter", '0y 0m 0d', (new Date(2015, 9, 1)));
    createDatePicker("#filter_date", '-24y', '-10y');
    createDatePicker("#from_date", '0y 0m 0d', (new Date(2015, 9, 1)));
    createDatePicker("#to_date", '0y 0m 0d', (new Date(2015, 9, 1)));

    $('#grievance-modal').on('show.bs.modal', function (event) {
        var viewMode = $('#grievance-modal').data('view_mode');
        createDatePicker("#id_date", '-24y', '-10y');
        switch (viewMode) {
            case 'add':
                $('#grievance-modal .input-sm').val("");
                $("#grievances-form").validate().resetForm();
                $("#grievance-modal #grievances-form-submit").removeClass('hidden');
                $("#grievance-modal #btn_cancel_action").html('Cancel');
                break;
            case 'edit':
                $("#grievance-modal #grievances-form-submit").removeClass('hidden');
                $("#grievance-modal #btn_cancel_action").html('Cancel');
                break;
            case 'view':
                $("#grievance-modal #grievances-form-submit").addClass('hidden');
                $("#grievance-modal #btn_cancel_action").html('Close');
                break;
        }
    });

    function getAge(birthDate) {
        var now = new Date();

        function isLeap(year) {
            return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
        }

        var days = Math.floor((now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24);
        var age = 0;

        for (var y = birthDate.getFullYear(); y <= now.getFullYear(); y++) {
            var daysInYear = isLeap(y) ? 366 : 365;
            if (days >= daysInYear) {
                days -= daysInYear;
                age++;
            }
        }
        return age;
    }

    jQuery.validator.addMethod("phoneKE", function (phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, "");
        if (phone_number == "")
            return true;
        return (phone_number.length == 10 && phone_number.match(/^((\([0-9]{2,3}\)[ \-]*)|([0-9]{2,4})[ \-]*)*?[0-9]{3,4}?[ \-]*[0-9]{3,4}?$/));
    }, "Please specify a valid phone number e.g. 07XXXXXXXX");

    jQuery.validator.addMethod("minTwoNames", function (first_name, element) {
        var nameArray = [$('#id_first_name').val(), $('#id_middle_name').val(), $('#id_last_name').val()];
        var countOfNameParts = 0
        $.each(nameArray, function (index, namePart) {
            if ($.trim(namePart) != "")
                countOfNameParts++;
        });
        return countOfNameParts > 1;
    }, " * Please enter at least 2 Names");

    $.validator.addMethod('positiveNumber', function (value) {
        return Number(value) >= 0;
    }, ' Enter a positive number.');

    $.validator.addMethod('positiveNumberZeroExclusive', function (value) {
        if (value == "")
            return true;
        return Number(value) > 0;
    }, ' Enter a positive number greater than 0.');

    $.validator.addMethod('matchingAgeDisaggregatedCount', function (value) {
        var pple_in_household = parseInt($('#id_no_of_people_in_household').val());
        var adults_in_household = parseInt($('#id_no_of_adults').val());
        var children_in_household = parseInt($('#id_no_of_children').val());
        if (isNaN(adults_in_household) || isNaN(children_in_household) || isNaN(pple_in_household) || pple_in_household != (adults_in_household + children_in_household))
            return false;

        return true;
    }, ' ');

    $.validator.addMethod('matchingGenderDisaggregatedCount', function (value) {
        var pple_in_household = parseInt($('#id_no_of_people_in_household').val(), 10);
        var males_in_household = parseInt($('#id_no_of_males').val(), 10);
        var females_id_household = parseInt($('#id_no_of_females').val(), 10);

        if (isNaN(females_id_household) || isNaN(males_in_household) || isNaN(pple_in_household) || pple_in_household != (males_in_household + females_id_household))
            return false;
        return true;
    }, ' ');

    $.validator.addMethod('under18WithID', function (value) {
        var date_of_birth = $('#id_date_of_birth').val();
        var currDOB = new Date(date_of_birth);
        
        var age = getAge(currDOB);
        var verificationDoc = $('#id_verification_document').val() || 0;
        if (age < 18 && verificationDoc == 2)
            return false;
        return true;
    }, ' ');

    $.validator.addMethod('selectOVCAttributesIfOvcSelected', function (value) {
        var ovcCheckboxChecked = $('input[type=checkbox][name=ovc_checkbox]').prop('checked');
        var ovc = $('select[name=external_organisation]').find(":selected").val();
        var ovcId = $('input[name=ovc_id]').val();
        return ovcCheckboxChecked ? (ovc != '' && ovcId != '') : true;
    });

    //requiresChildren
    $.validator.addMethod('requiresChildren', function (value) {
        var hasBiologicalChildren = $('#id_has_biological_children').val() || 0
        var noOfBiologicalChildren = parseInt($('#id_no_of_biological_children').val()) || 0;

        if (hasBiologicalChildren == 1 && noOfBiologicalChildren < 1)
            return false;
        return true;
    }, ' ');

    //positiveNumberZeroExclusive
    $.validator.addMethod('requiredIfEverHadSex', function (value) {
        var isEntered = false;
        if (value != "")
            isEntered = true;
        var ever_had_sex = parseInt($('#id_ever_had_sex').val(), 10) || 0;

        if (ever_had_sex > 0 && !isEntered)
            return false;
        return true;
    }, ' ');

    //requiredIfOtherSpecify
    $.validator.addMethod('requiredIfOtherSpecify', function (value) {
        var isEntered = false;
        if (value != "" && value.toString() != "0")
            isEntered = true;
        var other_specify = parseInt($('#id_verification_document').val(), 10) || 0;

        if (other_specify == 96 && !isEntered)
            return false;
        return true;
    }, ' ');

    $('#grievances-form').validate({
        rules: {
            date: {
                required: true
            },
            implementing_partner: {
                required: true
            },
            county: {
                required: true
            },
            ward: {
                required: true
            },
            reporter_name: {
                required: true
            },
            reporter_category: {
                required: true
            },
            reporter_phone: {
                required: true,
                phoneKE: true
            },
            received_by: {
                required: true
            },
            receiver_designation: {
                required: true
            },
            grievance_nature: {
                required: true
            },
            person_responsible: {
                required: true
            }
        },
        messages: {
            date: {
                required: "* Please enter your Date"
            },
            implementing_partner: {
                required: "* Please select Implementing Partner"
            },
            id_county: {
                required: "* Please select County"
            },
            id_ward: {
                required: "* Please select Ward"
            },
            reporter_name: {
                required: "* Please enter name of Reporter"
            },
            reporter_category: {
                required: "* Please select Reporter Category"
            },
            reporter_phone: {
                phoneKE: "* Please enter a valid Phone Number e.g. 07XXXXXXXX"
            },
            received_by: {
                required: "* Please enter Receiver's Name"
            },
            receiver_designation: {
                required: "* Please Receiver's Designation"
            },
            grievance_nature: {
                required: "* Please select Nature of Grievance"
            },
            person_responsible: {
                required: "* Please enter the Person Responsible"
            }
        },
        highlight: function (element) {
            $('#grievances-form').find('.error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $(element).parent().find('.error').removeClass('text-danger')
        }
    });

    function viewGrievance(grievanceId, readonly) {
        $.ajax({
            url: '/grievances/get',
            type: "GET",
            dataType: 'json',
            data: {'grievance_id': grievanceId},
            success: function (data) {
                var grievance = $.parseJSON(data.grievance)[0];
                if (data.status == 'fail') {
                    $('#grievances_alert').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible')
                }
                else {
                    $("#grievances-form #id").val(grievanceId);
                    $.each(Object.keys(grievance.fields), function (index, key) {
                        $("#grievances-form #id_" + key).val(grievance.fields[key]);
                        if (readonly) {
                            $("#grievance-modal").data('view_mode', 'view');
                            $("#grievances-form #id_" + key).attr('disabled', 'disabled');
                        }
                        else {
                            $("#grievance-modal").data('view_mode', 'edit');
                            $("#grievances-form #id_" + key).attr('disabled', false);
                        }
                    });

                    $("#grievance-modal").modal('show');
                }
            },

            error: function (xhr, errmsg, err) {
                alert("Failed " + errmsg + " " + err);
            }
        });
    }

    function deleteGrievance(grievanceId) {
        $.ajax({
            url: '/grievances/delete',
            type: "POST",
            dataType: 'json',
            data: {'id': grievanceId},
            success: function (data) {
                if (data.status == 'fail') {

                    $('#grievances_alert').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible')
                }
                else {
                    $('#dreams-grievance-table #grievance_' + grievanceId).remove();
                    $('#grievances_alert').removeClass('hidden').addClass('alert-success')
                        .text(data.message)
                        .trigger('madeVisible')
                }
                $('#confirmationModal').modal('hide');
            },

            error: function (xhr, errmsg, err) {
                alert("Failed " + errmsg + " " + err);
            }
        });
    }

    $('.grievance-action').click(function (e) {
        var action = '';
        var viewMode = $(this).data('view_mode');
        var grievanceId = $(this).data('grievance_id');

        switch (viewMode) {
            case 'add':
                $('#grievance-modal').data('view_mode', 'add');
                $('#grievance-modal').modal({show: true});
                break;
            case 'view':
                viewGrievance(grievanceId, true);
                break;
            case 'edit':
                viewGrievance(grievanceId, false);
                break;
            case 'delete':
                $('#confirmationModal #frm_title').html('Confirm Grievance Delete Action');
                $('#confirmationModal #frm_body > h4').html('Are you sure you want to Delete Grievance? This action cannot be undone.');
                $('#confirmationModal').modal({show: true});

                $('#confirmationModal #dataConfirmOK').click(function (event) {
                    deleteGrievance(grievanceId);
                    $(event.target).off('click');
                });
                break;
            default:
                return;
        }
    });

    $('#cash-transfer-details-modal').on('show.bs.modal', function (e) {
        var id = $('#cash-transfer-details-form #id').val();
        if (id == '' || id == null) {
            $('#cash-transfer-details-form input').val("");
            $('#cash-transfer-details-form select').val(0).change();
        }
        else {
            if ($('#cash-transfer-details-form #id_is_client_recepient').prop('checked')) {
                $('#cash-transfer-details-form #fg-ct_form-recipient').addClass('hidden');
                $('#cash-transfer-details-form #fg-recipient_relationship_with_client').addClass('hidden');
                $('#cash-transfer-details-form #id_client').val($("#id_client option:nth-child(2)").val());
                $('#cash-transfer-details-form.fg-client').removeClass('hidden');
            }
            else {
                $('#cash-transfer-details-form #fg-ct_form-recipient').removeClass('hidden');
                $('#cash-transfer-details-form #fg-recipient_relationship_with_client').removeClass('hidden');
                $('#cash-transfer-details-form .fg-client').addClass('hidden');
            }

            var selectedText = $('#cash-transfer-details-form #id_payment_mode option:selected').text();
            var selectedIndex = $('#cash-transfer-details-form #id_payment_mode').val();
            $('#cash-transfer-details-form .fg-mode').addClass('hidden');
            if (id == '' || id == null)
                $('#cash-transfer-details-form .fg-mode input').val("");
            if ($.inArray('Mobile', selectedText.split(' ')) > -1)
                $('#cash-transfer-details-form .fg-mode-mobile-money').removeClass('hidden');
            else if ($.inArray('Bank', selectedText.split(' ')) > -1)
                $('#cash-transfer-details-form .fg-mode-bank').removeClass('hidden');
        }
    });

    $('#cash-transfer-details-form').validate({
        rules: {
            recipient_phone_number: {
                phoneKE: true
            }
        },
        messages: {
            recipient_phone_number: {
                phoneKE: "* Please enter a valid Phone Number e.g. +2547XXXXXXXX or 07XXXXXXXX"
            }
        },
        highlight: function (element) {
            $('#cash-transfer-details-form').find('.error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $(element).parent().find('.error').removeClass('text-danger')
        }
    });

    $('#cash-transfer-details-form-submit').click(function (e) {
        if (!$('#cash-transfer-details-form').valid())
            return;

        $.ajax({
            url: '/cashTransfer/save',
            type: "POST",
            dataType: 'json',
            data: $('#cash-transfer-details-form').serialize(),
            success: function (data) {
                var ct_detail_id = data.ct_detail_id;
                if (data.status == 'fail') {
                    $('#action_alert_gen').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                }
                else {
                    if ($('#cash-transfer-details-form #id').val().trim() == "")
                        $('#cash-transfer-details-form #id').val(ct_detail_id)
                    $('#action_alert_gen').removeClass('hidden').addClass('alert-success')
                        .text(data.message)
                        .trigger('madeVisible');
                    $('#cash-transfer-details-modal').modal('hide');
                }
            },

            error: function (xhr, errmsg, err) {
                alert("Failed: " + errmsg + " " + err);
            }
        });
    });

    $('#forgot_password').click(function (e) {
        $(this).html("Please contact System Administrator for a new password!").css('color', '#F00');
    });

    $('#clientSearchOption').change(function (event) {
        var searchOption = $(event.target).val();
        $('#client_search_errors').html("").addClass("hidden");
        if (searchOption == "search_dreams_id") {
            $('.search_dreams_id').removeClass("hidden").addClass("shown");
            $('.search_name').addClass("hidden");
        }
        else if (searchOption == "search_name") {
            $('.search_dreams_id').addClass("hidden");
            $('.search_name').removeClass("hidden").addClass("shown");
        }
    });

    $("#enrollment-form").validate({
        groups: {
            full_name: "id_first_name id_middle_name id_last_name"
        },
        rules: {
            implementing_partner: {
                required: true,
            },
            age_of_household_head: {
                minTwoNames: true
            },
            first_name: {
                minTwoNames: true
            },
            middle_name: {
                minTwoNames: true
            },
            last_name: {
                minTwoNames: true
            },
            date_of_birth: {
                required: true
            },
            date_of_enrollment: {
                required: true
            },
            verification_document: {
                required: true,
                number: true,
                under18WithID: true
            },
            verification_document_other: {
                requiredIfOtherSpecify: true
            },
            marital_status: {
                required: true,
                number: true
            },
            phone_number: {
                phoneKE: true
            },
            county_of_residence: {
                required: true
            },
            sub_county: {
                required: true
            },
            ward: {
                required: true
            },
            guardian_phone_number: {
                phoneKE: true
            },
            guardian_national_id: {
                number: true
            },
            ovc_checkbox: {
                selectOVCAttributesIfOvcSelected: true
            }
        },
        messages: {
            implementing_partner: {
                required: " * Please enter your Client Implementing Partner"
            },
            first_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            first_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            middle_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            last_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            date_of_birth: {
                required: " * Please select Client's Date of Birth"
            },
            date_of_enrollment: {
                required: " * Please select Client's Date of Enrolment"
            },
            verification_document: {
                required: " * Please Select Client's Verification Document",
                under18WithID: " National ID is not Applicable for girls under 18 years of age."
            },
            verification_document_other: {
                requiredIfOtherSpecify: "* Required field"
            },
            marital_status: {
                required: " * Please Select Client's Marital Status"
            },
            phone_number: {
                phoneKE: " * Please enter valid Phone number"
            },
            county_of_residence: {
                required: " * Please Select Client's County of Residence"
            },
            sub_county: {
                required: " * Please Select Client's Sub County"
            },
            ward: {
                required: " * Please Select Client's Ward"
            },
            guardian_phone_number: {
                phoneKE: " * Please enter Valid Phone number"
            },
            guardian_national_id: {
                number: " * Please enter valid National ID"
            },
            ovc_checkbox: {
                selectOVCAttributesIfOvcSelected: 'Please ensure that the OVC and OVC client ID are indicated'
            }
        },
        highlight: function (element) {
            $('#form_demographics .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_demographics').find('.error').removeClass('text-danger')
        }
    });

    $("#form_demographics").validate({
        groups: {
            full_name: "id_first_name id_middle_name id_last_name"
        },
        rules: {
            implementing_partner: {
                required: true
            },
            first_name: {
                minTwoNames: true
            },
            middle_name: {
                minTwoNames: true
            },
            last_name: {
                minTwoNames: true
            },
            date_of_birth: {
                required: true
            },
            date_of_enrollment: {
                required: true
            },
            verification_document: {
                required: true,
                number: true,
                under18WithID: true
            },
            verification_document_other: {
                requiredIfOtherSpecify: true
            },
            marital_status: {
                required: true,
                number: true
            },
            phone_number: {
                phoneKE: true
            },
            guardian_phone_number: {
                phoneKE: true
            },
            guardian_national_id: {
                number: true
            },
            ovc_checkbox: {
                selectOVCAttributesIfOvcSelected: true
            }
        },
        messages: {
            implementing_partner: {
                required: " * Please enter your Client Implementing Partner"
            },
            first_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            middle_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            last_name: {
                minTwoNames: " * Please enter at least 2 Names"
            },
            date_of_birth: {
                required: " * Please select Client's Date of Birth"
            },
            date_of_enrollment: {
                required: " * Please select Client's Date of Enrolment"
            },
            verification_document: {
                required: " * Please Select Client's Verification Document",
                under18WithID: " National ID is not Applicable for girls under 18 years of age."
            },
            verification_document_other: {
                requiredIfOtherSpecify: "* Required field"
            },
            marital_status: {
                required: " * Please Select Client's Marital Status"
            },
            phone_number: {
                phoneKE: " * Please enter valid Phone number"
            },
            guardian_phone_number: {
                phoneKE: " * Please enter Valid Phone number"
            },
            guardian_national_id: {
                number: " * Please enter valid National ID"
            },
            ovc_checkbox: {
                selectOVCAttributesIfOvcSelected: 'Please ensure that the OVC and OVC client ID are indicated'
            }
        },
        highlight: function (element) {
            $('#form_demographics .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_demographics').find('.error').removeClass('text-danger')
        }
    });

    $.validator.addMethod('requiredIfHeadOfHouseholdIsOtherSpecify', function (value) {
        var isEntered = false;
        if (value != "")
            isEntered = true;
        var head_of_household = parseInt($('#id_head_of_household').val(), 10) || 0;

        if (head_of_household == 96 && !isEntered)
            return false;
        return true;
    }, ' ');

    $("#form_ind_household").validate({
        rules: {
            head_of_household: {
                required: true
            },
            head_of_household_other: {
                requiredIfHeadOfHouseholdIsOtherSpecify: true
            },
            age_of_household_head: {
                number: true,
                positiveNumberZeroExclusive: true
            },
            is_father_alive: {
                required: true
            },
            is_mother_alive: {
                required: true
            },
            is_parent_chronically_ill: {
                required: true
            },
            main_floor_material: {
                required: true
            },
            main_roof_material: {
                required: true
            },
            main_wall_material: {
                required: true
            },
            source_of_drinking_water: {
                required: true
            },
            ever_missed_full_day_food_in_4wks: {
                required: true
            },
            has_disability: {
                required: true
            },
            no_of_people_in_household: {
                required: true,
                number: true,
                positiveNumber: true
            },
            no_of_females: {
                required: true,
                number: true,
                positiveNumber: true
            },
            no_of_males: {
                required: true,
                number: true,
                positiveNumber: true,
                matchingGenderDisaggregatedCount: true
            },
            no_of_adults: {
                required: true,
                number: true,
                positiveNumber: true
            },
            no_of_children: {
                required: true,
                number: true,
                positiveNumber: true,
                matchingAgeDisaggregatedCount: true
            },
            ever_enrolled_in_ct_program: {
                required: true
            }
        },
        messages: {
            head_of_household: {
                required: " * Please Select Head of Household"
            },
            head_of_household_other: {
                requiredIfHeadOfHouseholdIsOtherSpecify: "* Please Specify household head"
            },
            age_of_household_head: {
                number: " Enter valid age e.g 45"
            },
            is_father_alive: {
                required: " * Required field"
            },
            is_mother_alive: {
                required: " * Required field"
            },
            is_parent_chronically_ill: {
                required: " * Required field"
            },
            main_floor_material: {
                required: " * Required field"
            },
            main_roof_material: {
                required: " * Required field"
            },
            main_wall_material: {
                required: " * Required field"
            },
            source_of_drinking_water: {
                required: " * Required field"
            },
            ever_missed_full_day_food_in_4wks: {
                required: " * Required field"
            },
            has_disability: {
                required: " * Required field"
            },
            no_of_people_in_household: {
                required: " * Required field",
                number: " Enter valid number e.g 5"
            },
            no_of_females: {
                required: " * Required field",
                number: " Enter valid number e.g 5"
            },
            no_of_males: {
                required: " * Required field",
                number: " Enter valid number e.g 5",
                matchingGenderDisaggregatedCount: " Number of females and males in household do not add up."
            },
            no_of_adults: {
                required: " * Required field",
                number: " Enter valid number e.g 5"
            },
            no_of_children: {
                required: " * Required field",
                number: " Enter valid number e.g 5",
                matchingAgeDisaggregatedCount: " Number of adults and children in household do not add up."
            },
            ever_enrolled_in_ct_program: {
                required: " * Required field"
            }
        },
        highlight: function (element) {
            $('#form_ind_household .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_ind_household').find('.error').removeClass('text-danger')
        }
    });

    $("#form_edu_and_employment").validate({
        rules: {
            currently_in_school: {
                required: true
            },
            has_savings: {
                required: true
            }
        },
        messages: {
            currently_in_school: {
                required: " * Please Select Head of Household"
            },
            has_savings: {
                required: " * Required field"
            }
        },
        highlight: function (element) {
            $('#form_edu_and_employment .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_edu_and_employment').find('.error').removeClass('text-danger')
        }
    });

    $("#form_hiv_testing").validate({
        rules: {
            ever_tested_for_hiv: {
                required: true
            }
        },
        messages: {
            ever_tested_for_hiv: {
                required: " * Required field"
            }
        },
        highlight: function (element) {
            $('#form_hiv_testing .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_hiv_testing').find('.error').removeClass('text-danger')
        }
    });

    $.validator.addMethod('requiredPositiveIfHasCurrentSexualPartnerElseZero', function (value) {
        var isEntered = false;
        var sexualPartnersInLast12Months = 0;
        if (value != "")
            sexualPartnersInLast12Months = parseInt(value, 10) || 0;
        isEntered = true;
        var has_sexual_partner = parseInt($('#id_has_sexual_partner').val(), 10) || 0;
        if (has_sexual_partner == 1 && (!isEntered || (sexualPartnersInLast12Months == 0)))
            return false;
        return true;
    }, ' ');

    $("#form_sexuality").validate({
        rules: {
            ever_had_sex: {
                required: true
            },
            age_at_first_sexual_encounter: {
                requiredIfEverHadSex: true,
                positiveNumberZeroExclusive: true
            },
            has_sexual_partner: {
                requiredIfEverHadSex: true
            },
            sex_partners_in_last_12months: {
                requiredIfEverHadSex: true,
                requiredPositiveIfHasCurrentSexualPartnerElseZero: true
            }
        },
        messages: {
            ever_had_sex: {
                required: " * Required field"
            },
            age_at_first_sexual_encounter: {
                requiredIfEverHadSex: " * Required field",
                positiveNumberZeroExclusive: "Enter a positive number greater than 0."
            },
            has_sexual_partner: {
                positiveNumber: " Enter positive number e.g 0,1,2...",
                requiredIfEverHadSex: "* Required field"
            },
            sex_partners_in_last_12months: {
                requiredIfEverHadSex: " * Required field",
                requiredPositiveIfHasCurrentSexualPartnerElseZero: " * Number of sex partners should be greater than Zero"
            }
        },
        highlight: function (element) {
            $('#form_sexuality .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_sexuality').find('.error').removeClass('text-danger')
        }
    });

    $("#form_rep_health").validate({
        rules: {
            fp_methods_awareness: {
                required: true
            },
            no_of_biological_children: {
                positiveNumber: true,
                requiresChildren: true
            },
            currently_pregnant: {
                required: true
            },
            known_fp_method: {
                required: true
            },
            currently_use_modern_fp: {
                required: true
            }
        },
        messages: {
            fp_methods_awareness: {
                required: " * Required field"
            },
            no_of_biological_children: {
                requiresChildren: "Number of biological children required."
            },
            currently_pregnant: {
                required: "* Required field"
            },
            known_fp_method: {
                required: "* Required field"
            },
            currently_use_modern_fp: {
                required: "* Required field"
            }
        },
        highlight: function (element) {
            $('#form_rep_health .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_rep_health').find('.error').removeClass('text-danger')
        }
    });

    $("#form_gbv").validate({
        rules: {
            humiliated_ever: {
                required: true
            },
            threats_to_hurt_ever: {
                required: true
            },
            insulted_ever: {
                required: true
            },
            economic_threat_ever: {
                required: true
            },
            physical_violence_ever: {
                required: true
            },
            physically_forced_sex_ever: {
                required: true
            },
            physically_forced_other_sex_acts_ever: {
                required: true
            },
            threatened_for_sexual_acts_ever: {
                required: true
            }
        },
        messages: {
            humiliated_ever: {
                required: " * Required field"
            },
            threats_to_hurt_ever: {
                required: " * Required field"
            },
            insulted_ever: {
                required: " * Required field"
            },
            economic_threat_ever: {
                required: " * Required field"
            },
            physical_violence_ever: {
                required: " * Required field"
            },
            physically_forced_sex_ever: {
                required: " * Required field"
            },
            physically_forced_other_sex_acts_ever: {
                required: " * Required field"
            },
            threatened_for_sexual_acts_ever: {
                required: " * Required field"
            }
        },
        highlight: function (element) {
            $('#form_gbv .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_gbv').find('.error').removeClass('text-danger')
        }
    });

    $("#form_drug_use").validate({
        rules: {
            used_alcohol_last_12months: {
                required: true
            },
            drug_abuse_last_12months: {
                required: true
            },
            produced_alcohol_last_12months: {
                required: true
            }
        },
        messages: {
            used_alcohol_last_12months: {
                required: " * Required field"
            },
            drug_abuse_last_12months: {
                required: " * Required field"
            },
            produced_alcohol_last_12months: {
                required: " * Required field"
            }
        },
        highlight: function (element) {
            $('#form_drug_use .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_drug_use').find('.error').removeClass('text-danger')
        }
    });

    $('.manual_download').click(function (event) {
        var item = event.target;
        var formID = $(item).data("form_id");
        $(formID).submit();
    });

    $('.listen-to-change').on('change keyup', function () {
        var val = $(this).val();
        var show_if_true = $(this).data('show_if_true');
        var hide_if_true = $(this).data('hide_if_true');
        var hide_if_false = $(this).data('hide_if_false');
        var show_value = $(this).data('show_value');

        if (!(typeof hide_if_false == undefined) && hide_if_false != null && hide_if_false != '') {
            var hide_classes = hide_if_false.split(" ");
            hide_if_false = hide_classes;
        }

        if (!(typeof hide_if_true == undefined) && hide_if_true != null && hide_if_true != '') {
            var hide_on_show_classes = hide_if_true.split(" ");
            hide_if_true = hide_on_show_classes;
        }

        if (val == show_value || show_value == 'any') {
            $('.' + show_if_true).removeClass('hidden');

            if (!(typeof hide_if_true == undefined) && hide_if_true != null && hide_if_true != '') {
                for (var i = 0; i < hide_if_true.length; i++) {
                    var class_name = hide_if_true[i];
                    $('.' + class_name).addClass('hidden');
                    $('.' + class_name).find('input,select').each(function () {
                        $(this).val('');
                        $(this).attr('checked', false);
                    });
                }
            }
        } else {
            $('.' + show_if_true).addClass('hidden');
            $('.' + show_if_true).find('input,select').each(function () {
                $(this).val('');
                $(this).attr('checked', false);
            });

            if (!(typeof hide_if_false == undefined) && hide_if_false != null && hide_if_false != '') {
                for (var i = 0; i < hide_if_false.length; i++) {
                    var class_name = hide_if_false[i];
                    $('.' + class_name).addClass('hidden');
                    $('.' + class_name).find('input,select').each(function () {
                        $(this).val('');
                        $(this).attr('checked', false);
                    });
                }
            }

            if (!(typeof hide_if_true == undefined) && hide_if_true != null && hide_if_true != '') {
                for (var i = 0; i < hide_if_true.length; i++) {
                    var class_name = hide_if_true[i];
                    $('.' + class_name).removeClass('hidden');
                }
            }
        }
    });

    $('.listen-to-change-listvalues').on('change keyup', function () {
        var val = $(this).val();
        var show_if_true_cascade = $(this).data('show_if_true_cascade');
        var hide_if_true_cascade = $(this).data('hide_if_true_cascade');
        var hide_if_false_cascade = $(this).data('hide_if_false_cascade');
        var show_value_cascade = $(this).data('show_value_cascade');

        if (!(typeof show_value_cascade == undefined) && show_value_cascade != null && show_value_cascade != '') {
            var show_value_cascade = show_value_cascade.split(" ");
        }

        if (!(typeof hide_if_false_cascade == undefined) && hide_if_false_cascade != null && hide_if_false_cascade != '') {
            var hide_classes = hide_if_false_cascade.split(" ");
            hide_if_false_cascade = hide_classes;
        }

        if (!(typeof hide_if_true_cascade == undefined) && hide_if_true_cascade != null && hide_if_true_cascade != '') {
            var hide_on_show_classes = hide_if_true_cascade.split(" ");
            hide_if_true_cascade = hide_on_show_classes;
        }

        if ($.inArray(val, show_value_cascade) >= 0) {
            $('.' + show_if_true_cascade).removeClass('hidden');

            if (!(typeof hide_if_true_cascade == undefined) && hide_if_true_cascade != null && hide_if_true_cascade != '') {
                for (var i = 0; i < hide_if_true_cascade.length; i++) {
                    var class_name = hide_if_true_cascade[i];
                    $('.' + class_name).addClass('hidden');
                    $('.' + class_name).find('input,select').each(function () {
                        $(this).val('');
                        $(this).attr('checked', false);
                    });
                }
            }
        } else {
            $('.' + show_if_true_cascade).addClass('hidden');
            $('.' + show_if_true_cascade).find('input,select').each(function () {
                $(this).val('');
                $(this).attr('checked', false);
            });

            if (!(typeof hide_if_false_cascade == undefined) && hide_if_false_cascade != null && hide_if_false_cascade != '') {
                for (var i = 0; i < hide_if_false_cascade.length; i++) {
                    var class_name = hide_if_false_cascade[i];
                    $('.' + class_name).addClass('hidden');
                    $('.' + class_name).find('input,select').each(function () {
                        $(this).val('');
                        $(this).attr('checked', false);
                    });
                }
            }

            if (!(typeof show_if_true_cascade == undefined) && show_if_true_cascade != null && show_if_true_cascade != '') {
                for (var i = 0; i < show_if_true_cascade.length; i++) {
                    var class_name = show_if_true_cascade[i];
                    $('.' + class_name).removeClass('hidden');
                }
            }
        }
    });

    $('#client-exit-modal').on('show.bs.modal', function (e) {
        var localToday = new Date();
        fetchAndLoadExitReasons();
        fetchFollowUpAttempts();
        $('#client-exit-modal #id_reason_for_exit').val('');
        createDatePicker("#client-exit-modal #id_date_of_exit", localToday, new Date(2015, 10, 1), localToday);
        $('#client-exit-modal #reason_for_exit_other').val('');
        $('#form_client_exit #error-space').text("");
        $("#client-exit-modal #id_date_of_exit").datepicker("setDate", localToday);
    });

    $('#client-unexit-modal').on('show.bs.modal', function (e) {
        var localToday = new Date();
        $('#client-unexit-modal #id_reason_for_unexit').val('');
        $('#client-unexit-modal #id_reason_for_exit').val('');
        createDatePicker("#client-unexit-modal #id_date_of_unexit", localToday, new Date(2015, 10, 1), localToday);
        $('#form_client_unexit #error-space').text("");

        var clientStatus = $('.client_status_action_text').html();
        if ($.trim(clientStatus) == 'Exit Client') {
            $('#lbl_client_exit_activation_label').html('Reason to Exit Client');
            $('#btn_submit_exit_client_form').val('Exit Client');
        }
        else {
            $('#lbl_client_exit_activation_label').html('Reason to Activate Client');
            $('#btn_submit_exit_client_form').html('Activate Client');
        }
        $('#error-space').text("");
    });

    $("#form_client_exit").validate({
        rules: { 
            reason_for_exit: {
                required: true
            },
            date_of_exit: {
                required: true
            }
        },
        messages: {
            reason_for_exit: {
                required: " * Required field"
            },
            date_of_exit: {
                required: " * Required field"
            }
        },
        highlight: function (element) {
            $('#form_client_exit .error').addClass('text-danger')
        },
        unhighlight: function (element) {
            $('#form_client_exit').find('.error').removeClass('text-danger')
        }
    });

    $("#form_client_unexit").validate({
        rules: { 
            reason_for_unexit: { 
                required: true 
            },
            date_of_unexit:{
                required:true
            }
        },
        messages: { 
             reason_for_unexit: { 
                required: " * Required field" 
            },
            date_of_exit:{
                required: " * Required field"
            }
        }, 
        highlight: function (element) { 
            $('#form_client_unexit .error').addClass('text-danger') 
        }, 
        unhighlight: function (element) { 
            $('#form_client_unexit').find('.error').removeClass('text-danger')
         }
    });

    $('select[name=reason_for_exit]').change(function () {
        var selectedOption = $(this).find(':selected').text();
        if (selectedOption == OTHER_CODE) {
            $('div#reason_for_exit_other_section').removeClass('hidden');
            $('fieldset#ltfu').addClass('hidden');
            $('label#reason_for_exit_error').text('');
            $('label#reason_for_exit_error').hide();
        } else if (selectedOption == LOST_TO_FOLLOW_UP_CODE) {
            $('div#reason_for_exit_other_section').addClass('hidden');
            $('div#reason_for_exit_other_section textarea#reason_for_exit_other').val('');
            if (followupAttempts < MIN_UNSUCCESSFUL_FOLLOW_UP_ATTEMPTS) {
                $('label#reason_for_exit_error').text('Warning: client has less than 4 follow up attempts');
                $('label#reason_for_exit_error').show();
            }
        } else {
            $('fieldset#ltfu').addClass('hidden');
            $('div#reason_for_exit_other_section').addClass('hidden');
            $('div#reason_for_exit_other_section textarea#reason_for_exit_other').val('');
            $('label#reason_for_exit_error').hide();
        }
    });

    $('#form_client_unexit').on('submit',function (event) {
        event.preventDefault();
        if(!$(event.target).valid()) return false;
        $('#form_client_unexit #error-space').text("");

        var reasonForUndoneExit = $('#form_client_unexit #id_reason_for_unexit').val();
        var dateOfUndoneExit = $('#form_client_unexit #id_date_of_unexit').val();

        if(reasonForUndoneExit == ''){
            $('#id_reason_for_unexit_error').html('* Required field').css({ 'color': 'red' });
        }
        if(dateOfUndoneExit == ''){
            $('#id_date_of_unexit_error').html('* Required field').css({ 'color': 'red' });
        }
        if(reasonForUndoneExit == '' || dateOfUndoneExit == '')
            return;

        var client_id = $('#current_client_id').val();
        if (typeof client_id == undefined || isNaN(client_id) || client_id == ''){
            return;
        }

        var csrftoken = getCookie('csrftoken');
        $.ajax({
            url : "/client/unexit",
            type : "POST",
            dataType: 'json',
            data : {
                csrfmiddlewaretoken : csrftoken,
                client_id : client_id,
                reason_for_exit: reasonForUndoneExit,
                date_of_unexit: dateOfUndoneExit
            },
            success: function (data) {
                if(data.status == 'success'){
                    var client_status = data.client_status;
                    $('#action_alert_gen').removeClass('hidden').addClass('alert-success')
                   .text(data.message + ' successfully')
                   .trigger('madeVisible');
                    $('.client_exit_voided_status').html(client_status);
                    $('.client_status_action_text').html('Exit Client');
                    $('p#p_exit_client').attr('data-target', '#client-exit-modal');
                    $('#client-unexit-modal').modal('hide');

                    // this hides add, edit, delete elements in followups, interventions, enrolment pages
                    addUserActions(interventionPermissionsGlobal);
                    $('.exit_unexit_toggle').show();
                    $('#client-unexit-modal').modal('hide');
                }
                else {
                    $('#action_alert_gen').removeClass('hidden').addClass('alert-danger')
                   .text(data.message)
                   .trigger('madeVisible');
                    $('#form_client_unexit #error-space').html(data.message);
                }
            },
            error: function (xhr, errmsg, err) {
                $('#action_alert_gen').removeClass('hidden').addClass('alert-danger')
               .text(xhr.responseText)
               .trigger('madeVisible');
                $('#form_client_unexit #error-space').html(xhr.responseText);
            }
        });
    });

    $('#form_client_exit').on('submit', function (event) {
        event.preventDefault();
        if (!$(event.target).valid())
            return false;
        $('#form_client_exit #error-space').text("");

        var reasonForExit = $('select[name=reason_for_exit]').find(':selected').val();
        var reasonForExitText = $('select[name=reason_for_exit]').find(':selected').text();
        var dateOfExit = $('#form_client_exit #id_date_of_exit').val();
        var exitComment = $('textarea#reason_for_exit_other').val();

        $('#error-space').text("");
        if (reasonForExit == '') {
            $('#reason_for_exit_error').html('* Required field').css({ 'color': 'red' });
            $('#reason_for_exit_error').show();
            return;
        }

        if ($.trim(reasonForExitText) == OTHER_CODE && $.trim(exitComment) == "") {
            $('#action_alert_gen').removeClass('hidden')
                                  .addClass('alert-danger')
                                  .text('Please ensure that reason for exit is entered.')
                                  .trigger('madeVisible');
            $('#reason_for_other_exit_error').html('* Required field').css({ 'color': 'red' });
            $('#reason_for_other_exit_error').show();
            return;
        }

        if (dateOfExit == '') {
            $('#date_of_exit_error').html('* Required field').css({ 'color': 'red' });
            $('#date_of_exit_error').show();
            return;
        }

        var client_id = $('#current_client_id').val();
        if (typeof client_id == undefined || isNaN(client_id) || client_id == '') {
            return;
        }

        var csrftoken = getCookie('csrftoken');
        $.ajax({
            url: "/client/exit",
            type: "POST",
            dataType: 'json',
            data: {
                csrfmiddlewaretoken: csrftoken,
                client_id: client_id,
                reason_for_exit: reasonForExit,
                exit_comment: exitComment,
                date_of_exit: dateOfExit
            },
            success: function (data) {
                if (data.status == 'success') {
                    var client_status = data.client_status;
                    $('#action_alert_gen').removeClass('hidden').addClass('alert-success')
                        .text(data.message + ' successfully')
                        .trigger('madeVisible');
                    $('.client_exit_voided_status').html(client_status);
                    $('.client_status_action_text').html('Undo Exit Client');
                    $('p#p_exit_client').attr('data-target', '#client-unexit-modal');
                    $('#client-exit-modal').modal('hide');

                    // this unhides add, edit, delete elements in followups, interventions, enrolment pages
                    $('.exit_unexit_toggle').hide();
                    $('#client-exit-modal').modal('hide');
                }
                else {
                    $('#action_alert_gen').removeClass('hidden').addClass('alert-danger')
                        .text(data.message)
                        .trigger('madeVisible');
                    $('#form_client_exit #error-space').html(data.message);
                }
            },
            error: function (xhr, errmsg, err) {
                $('#action_alert_gen').removeClass('hidden').addClass('alert-danger')
                    .text(xhr.responseText)
                    .trigger('madeVisible');
                $('#form_client_exit #error-space').html(xhr.responseText);
            }
        });
    });

    $('#collapseOne').on('shown.bs.collapse', function () {
        $('#search-expand-collapse-glyphicon').removeClass('glyphicon-plus').addClass('glyphicon-minus');
        $('#advanced_filter_text_span').html('Hide Advanced Search Filters');
        $('#is_advanced_search').val('True');
    });

    $('#collapseOne').on('hidden.bs.collapse', function () {
        $('#search-expand-collapse-glyphicon').removeClass('glyphicon-minus').addClass('glyphicon-plus');
        $('#advanced_filter_text_span').html('Show Search Advanced Filters');
        $('#is_advanced_search').val('False')
    });

    $('#btn_reset_advanced_search').click(function (e) {
        $('#doe_start_filter').val('');
        $('#doe_end_filter').val('');
        $('#county_filter').val('');
        $('#sub_county_filter').val('');
        $('#ward_filter').val('');
    });

    $("#btn_submit_transfer_client_form").click(function (e) {
        $('#client-transfer-form').submit();
    });

    $('#referral-category-interventions-select').change(function () {
        $('#referral-interventions-select').empty().append($("<option />").addClass("selected disabled hidden").attr("value", '').text('Select intervention'));
        var interventionsCategory = $(this).find(':selected').val();
        for (var interventionType in interventionTypes) {
            var interventionDetails = interventionTypes[interventionType].fields;
            if (interventionDetails['intervention_category'] == interventionsCategory)
                $('#referral-interventions-select').append($("<option />").attr("value", interventionDetails['code']).text(interventionDetails['name']));
        }
    });

    $('#client-make-referral-modal').on('shown.bs.modal', function (e) {
        fetchAndLoadInterventionTypes();
        fetchAndLoadImplementingPartners();
        fetchAndLoadExternalOrganizations();

        createDatePicker("#client-make-referral-form #referral-date", '+0Y +0M +0D', new Date(2015, 9, 1));

        $("#client-make-referral-modal #to-external-organization").prop('checked',false);

        var currDate = new Date();
        var year = currDate.getFullYear();
        var month = '00' + (currDate.getMonth() + 1);
        var day = '00' + currDate.getDate();
        var expiryDate = year + '-' + month.substr(month.length - 2, month.length)  + '-' + day.substr(day.length - 2, day.length);

        $('div#implementing-partner-div').show();
        $('div#external-organization-div').hide();
        $('div#other-external-organization-div').hide();
        $('#other-organization-name').val('');
        $('#client-make-referral-modal #expiry-date').val(expiryDate);
        $('#client-make-referral-form #referral-date').val('');
        $('#client-make-referral-form #error-space').text('');
    });

    var displayErrorMessage = function(elemID, message) {
        $('#' + elemID).removeClass('hidden').text(message).trigger('madeVisible');
    };

    $('form#client-make-referral-form').submit(function (e) {
        var interventionCategory = $('select#referral-category-interventions-select option:selected').val();
        var intervention = $('select#referral-interventions-select option:selected').val();
        var referralDate = $('#client-make-referral-form #referral-date').val();
        var implementingPartner = $('#client-make-referral-form #implementing-partners-select option:selected').val();
        var toExternalOrganization = $('input[name="to-external-organization"]').is(':checked');
        var externalOrganization = $('#client-make-referral-form #referral-external-organization-select option:selected').val();
        var otherOrganization = $('#client-make-referral-form #other-organization-name').val();
        var expiryDate = $('#client-make-referral-form #expiry-date').val();
        var comment = $('#client-make-referral-form #comment').text();

        $("#btn_submit_refer_client").attr("disabled", true);
        $('#referral_intervention_category_error').addClass('hidden');
        $('#referral_intervention_error').addClass('hidden');
        $('#external_organization_error').addClass('hidden');
        $('#implementing_partner_error').addClass('hidden');
        $('#referral_date_error').addClass('hidden');
        $('#referral_expiry_date_error').addClass('hidden');
        $("#btn_submit_refer_client").removeAttr("disabled");

        if (interventionCategory === '')
            displayErrorMessage('referral_intervention_category_error', 'Please select an intervention category type');

        if (intervention === '')
            displayErrorMessage('referral_intervention_error', 'Please select an intervention type');

        if (toExternalOrganization && ((externalOrganization === '' || externalOrganization === 'undefined')
            && (otherOrganization === '' || otherOrganization === 'undefined')))
            displayErrorMessage('external_organization_error', 'Please select external organization or implementing partner');

        if (!toExternalOrganization && (implementingPartner === '' || implementingPartner === 'undefined'))
            displayErrorMessage('implementing_partner_error', 'Please select an implementing partner');

        if (toExternalOrganization && externalOrganization === '')
            displayErrorMessage('external_organization_error', 'Please select an external organization');

        if (referralDate === '')
            displayErrorMessage('referral_date_error', 'Please insert a referral date').trigger('madeVisible');

        if (expiryDate === '')
            displayErrorMessage('referral_expiry_date_error', 'Please insert a referral expiry date');

        if ($('#referral_intervention_category_error').hasClass('hidden') &&
            $('#referral_intervention_error').hasClass('hidden') &&
            $('#external_organization_error').hasClass('hidden') &&
            $('#implementing_partner_error').hasClass('hidden') &&
            $('#referral_date_error').hasClass('hidden') &&
            $('#referral_expiry_date_error').hasClass('hidden')) {
            $.ajax({
                url: $(this).attr('action'),
                type: $(this).attr('method'),
                dataType: 'json',
                data: $('#client-make-referral-form').serialize(),
            }).done(function (data, textStatus, jqXHR) {
                var status = data.status;
                var message = data.message;
                var alert_id = $('#action_alert_gen');

                if (status == 'success') {
                    $(alert_id).addClass('alert-success');
                    $(alert_id).removeClass('hidden').text(message).trigger('madeVisible');
                    $('#client-make-referral-modal').modal('hide');

                } else if (status == 'fail') {
                    $(alert_id).addClass('alert-danger');
                    if (typeof message === "object") {
                        $.each(message, function (k, v) {
                            $("[name='" + k + "']").closest(".form-group").addClass('has-error');
                            $("span#help_" + k).html(v[0]);
                        });
                    } else {
                        $(alert_id).removeClass('hidden').text(message).trigger('madeVisible');
                    }
                    $('#client-make-referral-form #error-space').html(message);
                } else {
                    $('#client-make-referral-form #error-space').html(message);
                }
            }).error(function (xhr, errmsg, err) {
                $('#action_alert_gen').removeClass('hidden').addClass('alert-danger').text(xhr.responseText).trigger('madeVisible');
                $('#client-make-referral-form #error-space').html(xhr.responseText);
            });
        }

        $("#btn_submit_refer_client").removeAttr("disabled");
        e.preventDefault();
        e.stopPropagation();
    });

    $('#client-transfer-form').submit(function (e) {
        e.preventDefault();
        $("#btn_submit_transfer_client_form").attr("disabled", true);

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            dataType: 'json',
            data: $('#client-transfer-form').serialize(),
        }).done(function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);
            var status = data.status;
            var message = data.message;
            var alert_id = $('#action_alert_gen');

            if (status == 'fail') {
                $(alert_id).addClass('alert-danger');

                if (typeof message === "object") {
                    $.each(message, function (k, v) {
                        $("[name='" + k + "']").closest(".form-group").addClass('has-error');
                        $("span#help_" + k).html(v[0]);
                    });
                } else {
                    show_notification(alert_id, message);
                }
            }

            if (status == 'success') {
                $(alert_id).addClass('alert-success');
                show_notification(alert_id, message);
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
        }).always(function () {
            $("#btn_submit_transfer_client_form").attr("disabled", false);
            $("#btn_submit_transfer_client_form").removeAttr("disabled");
        });
    });

    function show_notification(alert_id, message) {
        $(alert_id).removeClass('hidden').text(message).trigger('madeVisible');
        $('#client-transfer-modal').modal('hide');
    }

    $('a[name=accept-transfer-modal]').click(function (e) {
        e.preventDefault();
        var el = $(this);
        $("#accept-transfer-modal #accept_client_transfer_id").val($(el).data('id'));
        $("#accept-transfer-modal #accept_client_name").text($(el).data('client-name'));
        $("#accept-transfer-modal #accept_client_dreams_id").text($(el).data('client-dreams-id'));
        $("#accept-transfer-modal #accept_client_date_of_birth").text($(el).data('client-date-of-birth'));
        $("#accept-transfer-modal").show();
    });

    $('a[name=reject-transfer-modal]').click(function (e) {
        e.preventDefault();
        var el = $(this);
        $("#reject-transfer-modal #reject_client_transfer_id").val($(el).data('id'));
        $("#reject-transfer-modal #reject_client_name").text($(el).data('client-name'));
        $("#reject-transfer-modal #reject_client_dreams_id").text($(el).data('client-dreams-id'));
        $("#reject-transfer-modal #reject_client_date_of_birth").text($(el).data('client-date-of-birth'));
        $("#reject-transfer-modal").show();
    });

    $('a[name=reject-referral-modal]').click(function (e) {
        e.preventDefault();
        var el = $(this);
        $("#reject-referral-modal #reject_client_referral_id").val($(el).data('id'));
        $("#reject-referral-modal #reject_client_name").text($(el).data('client-name'));
        $("#reject-referral-modal #reject_client_dreams_id").text($(el).data('client-dreams-id'));
        $("#reject-referral-modal #reject_client_date_of_birth").text($(el).data('client-date-of-birth'));
        $("#reject-referral-modal #reject_client_age_at_enrollment").text($(el).data('client-age-at-enrollment') + " years " + "(Current Age: " + $(el).data('client-current-age') + " years)");
        $("#reject-referral-modal #reject_client_intervention").text($(el).data('client-intervention-name'));
        $("#reject-referral-modal #reject_client_referral_date").text($(el).data('client-referral-date'));
        $("#reject-referral-modal #reject_client_referral_expiration_date").text($(el).data('client-referral-expiration-date'));
        $("#reject-referral-modal").show();
    });

    $('a[name=complete-referral-modal]').click(function (e) {
        e.preventDefault();
        var el = $(this);
        fetchIntervention($(el).data('referral-intervention-type-code'));
        $('#div-date-before-referral-date').hide();
        $("#referral-intervention-modal #intervention_client_name").text("For: " + $(el).data('client-name') + " (" + $(el).data('client-dreams-id') + ")" );
        $("#referral-intervention-modal #client").val($(el).data('client-id'));
        $("#referral-intervention-modal #intervention_client_date_of_birth").text("Date of Birth: " + $(el).data('client-date-of-birth'));
        $("#referral-intervention-modal #intervention_client_age_at_enrollment").text("Age at Enrollment: " + $(el).data('client-age-at-enrollment') + " years " + " (Current Age: " + $(el).data('client-current-age') + " years)");
        $("#referral-intervention-modal #intervention_id").val($(el).data('referral-intervention-type-id'));
        $("#referral-intervention-modal #intervention_type_code").val($(el).data('referral-intervention-type-code'));
        $("#referral-intervention-modal #intervention_type_name").text("Intervention: " + $(el).data('referral-intervention-type-name'));
        $("#referral-intervention-modal #client_referral_date").val($(el).data('client-referral-date'));
        $("#referral-intervention-modal #referral_id").val($(el).data('referral-id'));

        fetchExternalOrganisations('external-organization-select', 'referral-intervention-modal');
        $('#referral-intervention-modal #btn_save_referral_intervention').removeAttr("disabled");

        if (checkIfValueExists($(el).data('referral-external-organisation-id'))) {
            $('#referral-intervention-modal fieldset#external_organization_more_section').removeClass('hidden');
            $("#referral-intervention-modal #external-organization-select").val($(el).data('referral-external-organisation-id'));

        } else {
            $('#referral-intervention-modal fieldset#external_organization_more_section').addClass('hidden');
            $('#referral-intervention-modal #other_external_organization').hide();
            $("#referral-intervention-modal #other-external-organization").val('');
        }

        if (checkIfValueExists($(el).data('referral-external-organisation-other')) == true) {
            $('#referral-intervention-modal fieldset#external_organization_more_section').removeClass('hidden');
            $("#referral-intervention-modal #external-organization-select option:contains(Other)").attr('selected', true);
            $('#referral-intervention-modal #other_external_organization').show();
            $("#referral-intervention-modal #other-external-organization").val($(el).data('referral-external-organisation-other'));
        }

        // Check if there's need to show specify field
        showSection($(el).data('referral-intervention-type-is_specified') == "True", '#other_specify_section');
        // hts result
        showSection($(el).data('referral-intervention-type-has_hts_result') == "True", '#hts_result_section');
        // ccc number
        showSection($(el).data('referral-intervention-type-has_ccc_number') == "True", '#ccc_number_section');
        // pregnancy
        showSection($(el).data('referral-intervention-type-has_pregnancy_result') == "True", '#pregnancy_test_section');
        // number of sessions
        showSection($(el).data('referral-intervention-type-has_no_of_sessions') == "True", '#no_of_sessions_section');

        $("#referral-intervention-modal").show();
    });

    function checkIfValueExists(input_value) {
        return (input_value != null && input_value != 'undefined' && input_value != '' && input_value != 'None');
    }

    $('#referral-intervention-entry-form').submit(function (event) {
        event.preventDefault();
        $('#btn_save_referral_intervention').attr("disabled", "disabled");
        $('#referral-intervention-entry-form .processing-indicator').removeClass('hidden');
        var intervention_code =  $('#referral-intervention-entry-form #intervention_type_code').val();

        if (!validateInterventionEntryForm(intervention_code)) {
            $('#referral-intervention-entry-form #btn_save_referral_intervention').removeAttr("disabled");
            $('#referral-intervention-entry-form .processing-indicator').addClass('hidden');
            return false;
        }

        var postUrl = "/ivSave";
        var csrftoken = getCookie('csrftoken');

        $.ajax({
            url: postUrl,
            type: "POST",
            dataType: 'json',
            data: $('#referral-intervention-entry-form').serialize(),
            success: function (data) {
                var status = data.status;
                var message = data.message;
                var alert_id = '#action_alert_gen';
                if (status == 'fail') {
                    $(alert_id).removeClass('hidden').addClass('alert-danger')
                        .text(message)
                        .trigger('madeVisible');
                    $("#referral-intervention-modal").each(function () {
                        this.reset;
                    });

                    $('#referral-intervention-entry-form #btn_save_referral_intervention').removeAttr("disabled");
                    $('#referral-intervention-entry-form .processing-indicator').addClass('hidden');
                    $('#referral-intervention-entry-form #error-space').html("* " + message);
                }
                else {
                     $(alert_id).removeClass('hidden').addClass('alert-success')
                            .text(message)
                            .trigger('madeVisible');
                    $("#referral-intervention-modal").each(function () {
                        this.reset;
                    });
                    $('#referral-intervention-entry-form #btn_save_referral_intervention').removeAttr("disabled");
                    $('#referral-intervention-entry-form .processing-indicator').addClass('hidden');
                    $('#referral-intervention-modal').modal('hide');
                    setTimeout(window.location.reload.bind(location), 3000);
                }
            },

            error: function (xhr, errmsg, err) {
                $('#action_alert_gen').removeClass('hidden').addClass('alert-danger').text('An error occurred. Please try again: ' + errmsg);
                $('#referral-intervention-entry-form #btn_save_referral_intervention').removeAttr("disabled");
                console.log(xhr.status + " " + err + ": " + xhr.responseText);
                $('#referral-intervention-entry-form .processing-indicator').addClass('hidden');
                $('#referral-intervention-entry-form #error-space').html("* " + message);
            }
        });
    });

    function fetchIntervention(interventionTypeCode) {
        var csrftoken = getCookie('csrftoken');
        $('#referral-intervention-entry-form .processing-indicator').removeClass('hidden');
        $.ajax({
            url: "/ivgetType",
            type: "POST",
            dataType: 'json',
            async: false,
            data: {
                csrfmiddlewaretoken: csrftoken,
                type_code: interventionTypeCode
            },
            success: function (data) {
                currentInterventionType_Global = $.parseJSON(data.itype)[0];
                $('#referral-intervention-entry-form .processing-indicator').addClass('hidden');
            },
            error: function (xhr, errmsg, err) {
                $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: " + errmsg +
                    " <a href='#' class='close'>&times;</a></div>");
                console.log(xhr.status + ": " + xhr.responseText);
                $('#referral-intervention-entry-form .processing-indicator').addClass('hidden');
            }
        });
    }

    $("#accept-transfer-modal, #reject-transfer-modal, #client-transfer-modal, #client-void-modal, #reject-referral-modal").on('hidden.bs.modal', function () {
        $(this).each(function () {
            var form = $(this).find('form');
            form.trigger('reset');
            form.find(".form-group.has-error").each(function () {
                $(this).removeClass('has-error');
            });
            form.find(".help-block").each(function () {
                $(this).html("");
            });
        });
    });

    function getClientTransfersCount() {
        var el = $('#client-transfers-count-total-span');
        $.ajax({
            url: $(el).data('count-url')
        }).done(function (data, textStatus, jqXHR) {
            if (data != 0) {
                $(el).text(data).show();
                getClientTransfersInOutCount();
            } else {
                $(el).text("").hide();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + ": " + errorThrown);
        }).always(function () {
            setTimeout(getClientTransfersCount, 180000);
        });
    }

    function getClientTransfersInOutCount() {
        $.ajax({
            url: '/get-pending-client-transfers-in-out-count',
            dataType: 'json'
        }).done(function (data, textStatus, jqXHR) {
            $('#client-transfers-count-in-span').text(data[0]).show();
            $('#client-transfers-count-out-span').text(data[1]).show();
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + ": " + errorThrown);
        });
    }

    setTimeout(getClientTransfersCount(), 180000);

    function getClientReferralsCount() {
        var el = $('#client-referrals-count-total-span');

        $.ajax({
            url: $(el).data('count-url')
        }).done(function (data, textStatus, jqXHR) {
             if (data != 0) {
                $(el).text(data).show();
                getClientReferralsInOutCount();
            } else {
                $(el).text("").hide();
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + ": " + errorThrown);
        }).always(function () {
            setTimeout(getClientReferralsCount, 180000);
        });
    }

    function getClientReferralsInOutCount() {
        $.ajax({
            url: '/get-pending-client-referrals-in-out-count',
            dataType: 'json',
        }).done(function (data, textStatus, jqXHR) {
            $('#client-referrals-count-in-span').text(data[0]).show();
            $('#client-referrals-count-out-span').text(data[1]).show();

        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + ": " + errorThrown);
        }).always(function () {
            setTimeout(getClientReferralsCount, 180000);
        });
    }

    setTimeout(getClientReferralsCount(), 180000);

    $("#btn_submit_void_client_form").click(function (e) {
        e.preventDefault();
        $("#btn_submit_void_client_form").attr("disabled", true);
        var void_form = $("#void-client-form");
        var close_void_client_modal = true;

        $.ajax({
            url: void_form.attr('action'),
            type: void_form.attr('method'),
            dataType: 'json',
            data: void_form.serialize(),
        }).done(function (data, textStatus, jqXHR) {
            data = $.parseJSON(data);
            var status = data.status;
            var message = data.message;
            var alert_id = $('#action_alert_gen');

            if (status == 'fail') {
                $(alert_id).addClass('alert-danger');

                if (typeof message === "object") {
                    $.each(message, function (k, v) {
                        $("[name='" + k + "']").closest(".form-group").addClass('has-error');
                        $("span#help_" + k).html(v[0]);
                    });
                    close_void_client_modal = false;
                } else {
                    show_notification(alert_id, message);
                }
            }

            if (status == 'success') {
                window.location.href = data.next_url;
            }

        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + ": " + errorThrown);
        }).always(function () {
            $("#btn_submit_void_client_form").attr("disabled", false);
            $("#btn_submit_void_client_form").removeAttr("disabled");
            if (close_void_client_modal) {
                $('#client-void-modal').modal('hide');
            }
        });
    });

    $('#p_void_client').click(function (e) {
        e.preventDefault();
        var el = $(this);
        $("#client-void-modal #void_client_id").val($(el).data('client_id'));
        $("#client-void-modal").show();
    });

    $('#btn_submit_confirm_void_client_form').click(function (e) {
        e.preventDefault();

        $('#confirm-void-modal-footer').fadeOut('fast', function () {
            $('#void-modal-footer').fadeIn('fast');
        });
    });

    $("#client-void-modal").on('hidden.bs.modal', function () {
        $('#confirm-void-modal-footer').css('display', 'block');
        $('#void-modal-footer').css('display', 'none');
    });
});

$('.girl-ever-had-sex').change(function () {
    var value = $(this).val();
    if (value == 2) {
        $('#sex-related').addClass("hidden")
    }
    else {
        $('#sex-related').removeClass("hidden")
    }
});
