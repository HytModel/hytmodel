import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, MessageCircle, Lock, Eye, Database, UserCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../context/LanguageContext'

export default function Privacy() {
    const { t } = useTranslation()
    const lastUpdate = "13 janvier 2025"

    const Section = ({ number, titleKey, children }) => (
        <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-hyt-accent/20 flex items-center justify-center text-hyt-accent text-sm font-bold">{number}</span>
                {t(titleKey)}
            </h2>
            {children}
        </section>
    )

    const SubSection = ({ titleKey, icon: Icon, children }) => (
        <>
            <h3 className="text-lg font-semibold text-white mt-6 mb-3 flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 text-hyt-accent" />}
                {t(titleKey)}
            </h3>
            {children}
        </>
    )

    const P = ({ k }) => <p className="text-gray-300 leading-relaxed mb-4">{t(k)}</p>
    const List = ({ items }) => (
        <ul className="text-gray-300 space-y-2 ml-4 mb-4">
            {items.map((item, idx) => <li key={idx}>• {t(item)}</li>)}
        </ul>
    )

    return (
        <div className="min-h-screen bg-hyt-dark pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-hyt-accent/10 mb-6">
                        <Shield className="w-8 h-8 text-hyt-accent" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">{t('legal.privacy.title')}</h1>
                    <p className="text-gray-400">{t('legal.lastUpdate')} : {lastUpdate}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-hyt-card border border-hyt-border rounded-2xl p-8 md:p-12">
                    <div className="prose prose-invert max-w-none">

                        {/* Introduction */}
                        <section className="mb-10">
                            <P k="legal.privacy.intro.p1" />
                            <P k="legal.privacy.intro.p2" />
                        </section>

                        {/* Article 1 */}
                        <Section number="1" titleKey="legal.privacy.article1.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article1.p1')}</p>
                            <div className="bg-hyt-darker rounded-xl p-4 mb-4">
                                <p className="text-gray-300">
                                    <strong className="text-white">{t('legal.privacy.article1.company')}</strong><br />
                                    {t('legal.privacy.article1.address')}<br />
                                    Email : contact@hytstudio.com
                                </p>
                            </div>
                            <P k="legal.privacy.article1.p2" />
                        </Section>

                        {/* Article 2 */}
                        <Section number="2" titleKey="legal.privacy.article2.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article2.p1')}</p>

                            <SubSection titleKey="legal.privacy.article2.identification" icon={UserCheck}>
                                <List items={['legal.privacy.article2.id1', 'legal.privacy.article2.id2', 'legal.privacy.article2.id3', 'legal.privacy.article2.id4']} />
                            </SubSection>

                            <SubSection titleKey="legal.privacy.article2.technical" icon={Database}>
                                <List items={['legal.privacy.article2.tech1', 'legal.privacy.article2.tech2', 'legal.privacy.article2.tech3', 'legal.privacy.article2.tech4', 'legal.privacy.article2.tech5']} />
                            </SubSection>

                            <SubSection titleKey="legal.privacy.article2.transaction" icon={Lock}>
                                <List items={['legal.privacy.article2.trans1', 'legal.privacy.article2.trans2', 'legal.privacy.article2.trans3']} />
                            </SubSection>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
                                <p className="text-green-200 leading-relaxed">
                                    <strong>{t('legal.privacy.article2.paymentNote')}</strong> {t('legal.privacy.article2.paymentNoteText')}
                                </p>
                            </div>
                        </Section>

                        {/* Article 3 */}
                        <Section number="3" titleKey="legal.privacy.article3.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article3.p1')}</p>
                            <ul className="text-gray-300 space-y-3 ml-4">
                                {['purpose1', 'purpose2', 'purpose3', 'purpose4', 'purpose5', 'purpose6', 'purpose7'].map(key => (
                                    <li key={key}><strong className="text-white">{t(`legal.privacy.article3.${key}`)}</strong> {t(`legal.privacy.article3.${key}Desc`)}</li>
                                ))}
                            </ul>
                        </Section>

                        {/* Article 4 */}
                        <Section number="4" titleKey="legal.privacy.article4.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article4.p1')}</p>
                            <ul className="text-gray-300 space-y-3 ml-4">
                                {['legal1', 'legal2', 'legal3', 'legal4'].map(key => (
                                    <li key={key}><strong className="text-white">{t(`legal.privacy.article4.${key}`)}</strong> {t(`legal.privacy.article4.${key}Desc`)}</li>
                                ))}
                            </ul>
                        </Section>

                        {/* Article 5 */}
                        <Section number="5" titleKey="legal.privacy.article5.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article5.p1')}</p>
                            <ul className="text-gray-300 space-y-3 ml-4">
                                {['dest1', 'dest2', 'dest3', 'dest4', 'dest5'].map(key => (
                                    <li key={key}><strong className="text-white">{t(`legal.privacy.article5.${key}`)}</strong> {t(`legal.privacy.article5.${key}Desc`)}</li>
                                ))}
                            </ul>
                            <p className="text-gray-300 leading-relaxed mt-4">{t('legal.privacy.article5.noSale')}</p>
                        </Section>

                        {/* Article 6 */}
                        <Section number="6" titleKey="legal.privacy.article6.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article6.p1')}</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-gray-300 text-sm">
                                    <thead>
                                    <tr className="border-b border-hyt-border">
                                        <th className="text-left py-3 pr-4 text-white">{t('legal.privacy.article6.dataType')}</th>
                                        <th className="text-left py-3 text-white">{t('legal.privacy.article6.duration')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {[
                                        { type: 'account', dur: 'accountDuration' },
                                        { type: 'transactions', dur: 'transactionsDuration' },
                                        { type: 'invoices', dur: 'invoicesDuration' },
                                        { type: 'logs', dur: 'logsDuration' },
                                        { type: 'cookiesData', dur: 'cookiesDuration' }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-hyt-border/50">
                                            <td className="py-3 pr-4">{t(`legal.privacy.article6.${row.type}`)}</td>
                                            <td className="py-3">{t(`legal.privacy.article6.${row.dur}`)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        {/* Article 7 */}
                        <Section number="7" titleKey="legal.privacy.article7.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article7.p1')}</p>
                            <div className="grid gap-4 mb-4">
                                {[
                                    { key: 'access', icon: Eye },
                                    { key: 'rectification', icon: UserCheck },
                                    { key: 'erasure', icon: Trash2 },
                                    { key: 'portability', icon: Database },
                                    { key: 'opposition', icon: Lock }
                                ].map(({ key, icon: Icon }) => (
                                    <div key={key} className="bg-hyt-darker rounded-xl p-4">
                                        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-hyt-accent" />
                                            {t(`legal.privacy.article7.${key}`)}
                                        </h4>
                                        <p className="text-gray-400 text-sm">{t(`legal.privacy.article7.${key}Desc`)}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-gray-300 leading-relaxed">{t('legal.privacy.article7.exerciseRights')}</p>
                        </Section>

                        {/* Article 8 */}
                        <Section number="8" titleKey="legal.privacy.article8.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article8.p1')}</p>
                            <List items={['legal.privacy.article8.security1', 'legal.privacy.article8.security2', 'legal.privacy.article8.security3', 'legal.privacy.article8.security4', 'legal.privacy.article8.security5', 'legal.privacy.article8.security6']} />
                        </Section>

                        {/* Article 9 */}
                        <Section number="9" titleKey="legal.privacy.article9.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article9.p1')}</p>
                            <List items={['legal.privacy.article9.transfer1', 'legal.privacy.article9.transfer2', 'legal.privacy.article9.transfer3']} />
                        </Section>

                        {/* Article 10 */}
                        <Section number="10" titleKey="legal.privacy.article10.title">
                            <p className="text-gray-300 leading-relaxed">
                                {t('legal.privacy.article10.p1')} <Link to="/cookies" className="text-hyt-accent hover:underline">{t('legal.cookies.title')}</Link>.
                            </p>
                        </Section>

                        {/* Article 11 */}
                        <Section number="11" titleKey="legal.privacy.article11.title">
                            <P k="legal.privacy.article11.p1" />
                        </Section>

                        {/* Article 12 */}
                        <Section number="12" titleKey="legal.privacy.article12.title">
                            <P k="legal.privacy.article12.p1" />
                        </Section>

                        {/* Article 13 */}
                        <Section number="13" titleKey="legal.privacy.article13.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.privacy.article13.p1')}</p>
                            <div className="bg-hyt-darker rounded-xl p-4">
                                <p className="text-gray-300">
                                    <strong className="text-white">{t('legal.privacy.article13.cnil')}</strong><br />
                                    {t('legal.privacy.article13.cnilAddress')}<br />
                                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline">www.cnil.fr</a>
                                </p>
                            </div>
                        </Section>

                        {/* Contact */}
                        <section className="mt-12 pt-8 border-t border-hyt-border">
                            <h2 className="text-2xl font-bold text-white mb-6">{t('legal.contact')}</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.contactText')}</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <a href="mailto:contact@hytstudio.com" className="flex items-center gap-3 p-4 bg-hyt-darker rounded-xl hover:bg-hyt-darker/70 transition-colors">
                                    <Mail className="w-5 h-5 text-hyt-accent" />
                                    <span className="text-gray-300">contact@hytstudio.com</span>
                                </a>
                                <a href="https://discord.gg/3VJQZ6sjRR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-hyt-darker rounded-xl hover:bg-hyt-darker/70 transition-colors">
                                    <MessageCircle className="w-5 h-5 text-hyt-accent" />
                                    <span className="text-gray-300">{t('legal.discord')}</span>
                                </a>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}