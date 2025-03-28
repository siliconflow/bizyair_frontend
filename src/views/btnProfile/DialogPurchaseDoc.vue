<template>
    <div class="container">
        <header>
            <h1>{{ t('purchaseDoc.title') }}</h1>
        </header>

        <section>
            <h2>{{ t('purchaseDoc.service.title') }}</h2>
            <ol>
                <li>{{ t('purchaseDoc.service.platform') }}</li>
                <li>{{ t('purchaseDoc.service.types') }}
                    <ul>
                        <li><strong>{{ t('purchaseDoc.service.gold') }}</strong></li>
                        <li><strong>{{ t('purchaseDoc.service.silver') }}</strong></li>
                    </ul>
                </li>
            </ol>
        </section>

        <section>
            <h2>{{ t('purchaseDoc.rules.title') }}</h2>

            <div>
                <h3>{{ t('purchaseDoc.rules.acquisition.title') }}</h3>
                <ul>
                    <li>{{ t('purchaseDoc.rules.acquisition.methods') }}</li>
                    <li>{{ t('purchaseDoc.rules.acquisition.usage') }}</li>
                </ul>
            </div>

            <div>
                <h3>{{ t('purchaseDoc.rules.validity.title') }}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>{{ t('purchaseDoc.rules.validity.table.type') }}</th>
                            <th>{{ t('purchaseDoc.rules.validity.table.validPeriod') }}</th>
                            <th>{{ t('purchaseDoc.rules.validity.table.refundRule') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ t('btnProfile.coinsList.goldCoin') }}</td>
                            <td>{{ t('purchaseDoc.rules.validity.table.gold.period') }}</td>
                            <td>{{ t('purchaseDoc.rules.validity.table.gold.rule') }}</td>
                        </tr>
                        <tr>
                            <td>{{ t('btnProfile.coinsList.silverCoin') }}</td>
                            <td>{{ t('purchaseDoc.rules.validity.table.silver.period') }}</td>
                            <td>{{ t('purchaseDoc.rules.validity.table.silver.rule') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div>
                <h3>{{ t('purchaseDoc.rules.billing.title') }}</h3>

                <div>
                    <h4>{{ t('purchaseDoc.rules.billing.nodeTypes.title') }}</h4>
                    <p>{{ t('purchaseDoc.rules.billing.nodeTypes.desc') }}</p>
                    <ul>
                        <li><strong>{{ t('purchaseDoc.rules.billing.nodeTypes.goldOnly') }}</strong></li>
                        <li><strong>{{ t('purchaseDoc.rules.billing.nodeTypes.mixed') }}</strong></li>
                    </ul>
                </div>

                <div>
                    <h4>{{ t('purchaseDoc.rules.billing.execution.title') }}</h4>
                    <ul>
                        <li>{{ t('purchaseDoc.rules.billing.execution.rule1') }}</li>
                        <li>{{ t('purchaseDoc.rules.billing.execution.rule2') }}</li>
                        <li>{{ t('purchaseDoc.rules.billing.execution.rule3') }}</li>
                    </ul>
                </div>

                <div>
                    <h4>{{ t('purchaseDoc.rules.billing.special.title') }}</h4>
                    <p>{{ t('purchaseDoc.rules.billing.special.desc') }}</p>
                </div>
            </div>
        </section>

        <section>
            <h2>{{ t('purchaseDoc.userRights.title') }}</h2>
            <ol>
                <li><strong>{{ t('purchaseDoc.userRights.recharge.title') }}</strong>：{{ t('purchaseDoc.userRights.recharge.content') }}</li>
                <li><strong>{{ t('purchaseDoc.userRights.refund.title') }}</strong>：{{ t('purchaseDoc.userRights.refund.content') }}</li>
                <li><strong>{{ t('purchaseDoc.userRights.restriction.title') }}</strong>：{{ t('purchaseDoc.userRights.restriction.content') }}</li>
            </ol>
        </section>

        <section>
            <h2>{{ t('purchaseDoc.platformRights.title') }}</h2>
            <ol>
                <li><strong>{{ t('purchaseDoc.platformRights.service.title') }}</strong>：{{ t('purchaseDoc.platformRights.service.content') }}</li>
                <li><strong>{{ t('purchaseDoc.platformRights.abnormal.title') }}</strong>：{{ t('purchaseDoc.platformRights.abnormal.content') }}</li>
                <li><strong>{{ t('purchaseDoc.platformRights.disclaimer.title') }}</strong>：{{ t('purchaseDoc.platformRights.disclaimer.content') }}</li>
            </ol>
        </section>

        <section>
            <h2>{{ t('purchaseDoc.userBehavior.title') }}</h2>

            <div>
                <h3>{{ t('purchaseDoc.userBehavior.prohibited.title') }}</h3>
                <p>{{ t('purchaseDoc.userBehavior.prohibited.desc') }}</p>
                <ol>
                    <li>{{ t('purchaseDoc.userBehavior.prohibited.item1') }}</li>
                    <li>{{ t('purchaseDoc.userBehavior.prohibited.item2') }}</li>
                    <li>{{ t('purchaseDoc.userBehavior.prohibited.item3') }}</li>
                    <li>{{ t('purchaseDoc.userBehavior.prohibited.item4') }}</li>
                    <li>{{ t('purchaseDoc.userBehavior.prohibited.item5') }}</li>
                </ol>
            </div>

            <div>
                <h3>{{ t('purchaseDoc.userBehavior.breach.title') }}</h3>
                <p>{{ t('purchaseDoc.userBehavior.breach.desc') }}</p>
                <ol>
                    <li>{{ t('purchaseDoc.userBehavior.breach.item1') }}</li>
                    <li>{{ t('purchaseDoc.userBehavior.breach.item2') }}</li>
                    <li>{{ t('purchaseDoc.userBehavior.breach.item3') }}</li>
                </ol>
            </div>
        </section>

        <section>
            <h2>{{ t('purchaseDoc.other.title') }}</h2>
            <ol>
                <li><strong>{{ t('purchaseDoc.other.agreement.title') }}</strong>：{{ t('purchaseDoc.other.agreement.content') }}</li>
                <li><strong>{{ t('purchaseDoc.other.dispute.title') }}</strong>：{{ t('purchaseDoc.other.dispute.content') }}</li>
            </ol>
        </section>

        <section class="border-top">
            <h3>{{ t('purchaseDoc.keyPoints.title') }}</h3>
            <ul>
                <li><strong>{{ t('purchaseDoc.keyPoints.refund.title') }}</strong>：{{ t('purchaseDoc.keyPoints.refund.content') }}</li>
                <li><strong>{{ t('purchaseDoc.keyPoints.goldExpire.title') }}</strong>：{{ t('purchaseDoc.keyPoints.goldExpire.content') }}</li>
                <li><strong>{{ t('purchaseDoc.keyPoints.silverExpire.title') }}</strong>：{{ t('purchaseDoc.keyPoints.silverExpire.content') }}</li>
            </ul>
        </section>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped lang="less">
.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;

    header {
        margin-bottom: 30px;
        text-align: center;
    }

    h1 {
        font-size: 28px;
        margin-bottom: 10px;
        font-weight: 700;
    }

    h2 {
        font-size: 24px;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
    }

    h3 {
        font-size: 20px;
        margin: 25px 0 15px;
        font-weight: 500;
    }

    h4 {
        font-size: 18px;
        margin: 20px 0 10px;
        font-weight: 500;
    }

    ol,
    ul {
        padding-left: 24px;
        margin: 15px 0;
    }

    ol {
        list-style-type: decimal;
    }

    ul {
        list-style-type: disc;
    }

    li {
        margin-bottom: 8px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        border: 1px solid #ddd;
        table-layout: fixed;
    }

    th,
    td {
        padding: 10px 15px;
        border: 1px solid #ddd;
        text-align: left;
        word-wrap: break-word;
    }

    th:first-child,
    td:first-child {
        width: 15%;
        min-width: 100px;
    }

    th:nth-child(2),
    td:nth-child(2) {
        width: 25%;
    }

    th:nth-child(3),
    td:nth-child(3) {
        width: 60%;
    }

    th {
        background-color: rgba(255, 255, 255, .05);
        font-weight: 500;
    }

    tr:nth-child(even) {
        background-color: rgba(255, 255, 255, .05);
    }

    strong {
        font-weight: 600;
    }

    .border-top {
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 15px;
    }

    h1 {
        font-size: 24px;
    }

    h2 {
        font-size: 22px;
    }

    h3 {
        font-size: 19px;
    }
}
</style>
