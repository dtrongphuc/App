import React from 'react';
import {useOnyx} from 'react-native-onyx';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as WorkspaceRulesActions from '@userActions/Workspace/Rules';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type ExpenseReportRulesSectionProps = {
    policyID: string;
};

function ExpenseReportRulesSection({policyID}: ExpenseReportRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const preventSelfApprovalsUnavailable = policy?.approvalMode !== CONST.POLICY.APPROVAL_MODE.BASIC || policy?.errorFields?.approvalMode;
    const autoPayApprovedReportsUnavailable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

    const optionItems = [
        {
            title: translate('workspace.rules.expenseReportRules.customReportNamesTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.customReportNamesSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.customReportNamesTitle'),
            isActive: policy?.shouldShowCustomReportTitleOption,
            onToggle: (isEnabled: boolean) => WorkspaceRulesActions.enablePolicyDefaultReportTitle(isEnabled, policyID),
            subMenuItems: [
                <MenuItemWithTopDescription
                    description={translate('workspace.rules.expenseReportRules.customNameTitle')}
                    title={policy?.fieldList?.[CONST.POLICY.FIELD_LIST_TITLE_FIELD_ID].defaultValue}
                    shouldShowRightIcon
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM_NAME.getRoute(policyID))}
                />,
                <ToggleSettingOptionRow
                    title={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')}
                    switchAccessibilityLabel={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt6]}
                    titleStyle={styles.pv2}
                    isActive={!policy?.fieldList?.[CONST.POLICY.FIELD_LIST_TITLE_FIELD_ID].deletable}
                    onToggle={(isEnabled) => WorkspaceRulesActions.setPolicyPreventMemberCreatedTitle(isEnabled, policyID)}
                />,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.preventSelfApprovalsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            isActive: policy?.preventSelfApproval,
            disabled: preventSelfApprovalsUnavailable,
            showLockIcon: preventSelfApprovalsUnavailable,
            onToggle: (isEnabled: boolean) => WorkspaceRulesActions.setPolicyPreventSelfApproval(isEnabled, policyID),
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            subtitle: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            isActive: policy?.shouldShowAutoApprovalOptions,
            onToggle: (isEnabled: boolean) => {
                WorkspaceRulesActions.enableAutoApprovalOptions(isEnabled, policyID);
            },
            subMenuItems: [
                <MenuItemWithTopDescription
                    description={translate('workspace.rules.expenseReportRules.autoApproveReportsUnderTitle')}
                    title={CurrencyUtils.convertToDisplayString(policy?.autoApproval?.limit, policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                    shouldShowRightIcon
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_AUTO_APPROVE_REPORTS_UNDER.getRoute(policyID))}
                />,
                <MenuItemWithTopDescription
                    description={translate('workspace.rules.expenseReportRules.randomReportAuditTitle')}
                    title={`${policy?.autoApproval?.auditRate ?? 0}%`}
                    shouldShowRightIcon
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_RANDOM_REPORT_AUDIT.getRoute(policyID))}
                />,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            subtitle: autoPayApprovedReportsUnavailable
                ? translate('workspace.rules.expenseReportRules.autoPayApprovedReportsLockedSubtitle')
                : translate('workspace.rules.expenseReportRules.autoPayApprovedReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            onToggle: (isEnabled: boolean) => {
                WorkspaceRulesActions.enablePolicyAutoReimbursementLimit(isEnabled, policyID);
            },
            disabled: autoPayApprovedReportsUnavailable,
            showLockIcon: autoPayApprovedReportsUnavailable,
            isActive: policy?.shouldShowAutoReimbursementLimitOption,
            subMenuItems: [
                <MenuItemWithTopDescription
                    description={translate('workspace.rules.expenseReportRules.autoPayReportsUnderTitle')}
                    title={CurrencyUtils.convertToDisplayString(policy?.autoReimbursement?.limit, policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                    shouldShowRightIcon
                    style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                    onPress={() => Navigation.navigate(ROUTES.RULES_AUTO_PAY_REPORTS_UNDER.getRoute(policyID))}
                />,
            ],
        },
    ];

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.expenseReportRules.title')}
            subtitle={translate('workspace.rules.expenseReportRules.subtitle')}
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            {optionItems.map(({title, subtitle, isActive, subMenuItems, showLockIcon, disabled, onToggle}, index) => {
                const showBorderBottom = index !== optionItems.length - 1;

                return (
                    <ToggleSettingOptionRow
                        title={title}
                        subtitle={subtitle}
                        switchAccessibilityLabel={title}
                        wrapperStyle={[styles.pv6, showBorderBottom && styles.borderBottom]}
                        shouldPlaceSubtitleBelowSwitch
                        titleStyle={styles.pv2}
                        subtitleStyle={styles.pt1}
                        isActive={!!isActive}
                        showLockIcon={showLockIcon}
                        disabled={disabled}
                        subMenuItems={subMenuItems}
                        onToggle={onToggle}
                    />
                );
            })}
        </Section>
    );
}

export default ExpenseReportRulesSection;
