import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Mail, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../context/LanguageContext'

export default function Terms() {
    const { t } = useTranslation()
    const lastUpdate = "13 janvier 2025"

    const Section = ({ number, titleKey, children }) => (
        <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-hyt-accent/20 flex items-center justify-center text-hyt-accent text-sm font-bold">
                    {number}
                </span>
                {t(titleKey)}
            </h2>
            {children}
        </section>
    )

    const SubSection = ({ titleKey, children }) => (
        <>
            <h3 className="text-lg font-semibold text-white mt-6 mb-3">{t(titleKey)}</h3>
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
                        <FileText className="w-8 h-8 text-hyt-accent" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">{t('legal.terms.title')}</h1>
                    <p className="text-gray-400">{t('legal.lastUpdate')} : {lastUpdate}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-hyt-card border border-hyt-border rounded-2xl p-8 md:p-12">
                    <div className="prose prose-invert max-w-none">

                        {/* Préambule */}
                        <Section number="P" titleKey="legal.terms.preamble.title">
                            <P k="legal.terms.preamble.p1" />
                            <P k="legal.terms.preamble.p2" />
                            <P k="legal.terms.preamble.p3" />
                        </Section>

                        {/* Article 1 */}
                        <Section number="1" titleKey="legal.terms.article1.title">
                            <SubSection titleKey="legal.terms.article1.subtitle1">
                                <P k="legal.terms.article1.p1" />
                                <List items={['legal.terms.article1.vat', 'legal.terms.article1.emailContact', 'legal.terms.article1.director']} />
                            </SubSection>
                            <SubSection titleKey="legal.terms.article1.subtitle2">
                                <P k="legal.terms.article1.p2" />
                            </SubSection>
                        </Section>

                        {/* Article 2 */}
                        <Section number="2" titleKey="legal.terms.article2.title">
                            <p className="text-gray-300 leading-relaxed mb-4">{t('legal.terms.article2.intro')}</p>
                            <ul className="text-gray-300 space-y-3 ml-4">
                                {['platform', 'user', 'buyer', 'creator', 'affiliated', 'nonAffiliated', 'product', 'customOrder', 'account'].map(key => (
                                    <li key={key}><strong className="text-white">{t(`legal.terms.article2.${key}`)}</strong> {t(`legal.terms.article2.${key}Def`)}</li>
                                ))}
                            </ul>
                        </Section>

                        {/* Article 3 */}
                        <Section number="3" titleKey="legal.terms.article3.title">
                            <SubSection titleKey="legal.terms.article3.subtitle1"><P k="legal.terms.article3.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article3.subtitle2">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article3.p2')}</p>
                                <List items={['legal.terms.article3.condition1', 'legal.terms.article3.condition2', 'legal.terms.article3.condition3', 'legal.terms.article3.condition4']} />
                            </SubSection>
                            <SubSection titleKey="legal.terms.article3.subtitle3">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article3.p3')}</p>
                                <List items={['legal.terms.article3.password1', 'legal.terms.article3.password2', 'legal.terms.article3.password3']} />
                                <P k="legal.terms.article3.p4" />
                            </SubSection>
                        </Section>

                        {/* Article 4 */}
                        <Section number="4" titleKey="legal.terms.article4.title">
                            <SubSection titleKey="legal.terms.article4.subtitle1">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article4.p1')}</p>
                                <List items={['legal.terms.article4.buyer1', 'legal.terms.article4.buyer2', 'legal.terms.article4.buyer3', 'legal.terms.article4.buyer4', 'legal.terms.article4.buyer5', 'legal.terms.article4.buyer6']} />
                            </SubSection>
                            <SubSection titleKey="legal.terms.article4.subtitle2">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article4.p2')}</p>
                                <List items={['legal.terms.article4.creator1', 'legal.terms.article4.creator2', 'legal.terms.article4.creator3', 'legal.terms.article4.creator4', 'legal.terms.article4.creator5']} />
                            </SubSection>
                        </Section>

                        {/* Article 5 */}
                        <Section number="5" titleKey="legal.terms.article5.title">
                            <SubSection titleKey="legal.terms.article5.subtitle1"><P k="legal.terms.article5.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article5.subtitle2">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article5.p2')}</p>
                                <div className="bg-hyt-darker rounded-xl p-4 mb-4">
                                    <ul className="text-gray-300 space-y-3">
                                        <li><strong className="text-white">{t('legal.terms.article5.nonAffiliatedTitle')}</strong> {t('legal.terms.article5.nonAffiliatedDesc')}</li>
                                        <li><strong className="text-white">{t('legal.terms.article5.affiliatedTitle')}</strong> {t('legal.terms.article5.affiliatedDesc')}</li>
                                        <li><strong className="text-white">{t('legal.terms.article5.hytStudioTitle')}</strong> {t('legal.terms.article5.hytStudioDesc')}</li>
                                    </ul>
                                </div>
                            </SubSection>
                            <SubSection titleKey="legal.terms.article5.subtitle3"><P k="legal.terms.article5.p3" /></SubSection>
                        </Section>

                        {/* Article 6 */}
                        <Section number="6" titleKey="legal.terms.article6.title">
                            <SubSection titleKey="legal.terms.article6.subtitle1"><P k="legal.terms.article6.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article6.subtitle2">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article6.p2')}</p>
                                <List items={['legal.terms.article6.forbidden1', 'legal.terms.article6.forbidden2', 'legal.terms.article6.forbidden3', 'legal.terms.article6.forbidden4', 'legal.terms.article6.forbidden5']} />
                            </SubSection>
                            <SubSection titleKey="legal.terms.article6.subtitle3"><P k="legal.terms.article6.p3" /></SubSection>
                        </Section>

                        {/* Article 7 */}
                        <Section number="7" titleKey="legal.terms.article7.title">
                            <SubSection titleKey="legal.terms.article7.subtitle1"><P k="legal.terms.article7.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article7.subtitle2"><P k="legal.terms.article7.p2" /></SubSection>
                            <SubSection titleKey="legal.terms.article7.subtitle3"><P k="legal.terms.article7.p3" /></SubSection>
                        </Section>

                        {/* Article 8 */}
                        <Section number="8" titleKey="legal.terms.article8.title">
                            <SubSection titleKey="legal.terms.article8.subtitle1"><P k="legal.terms.article8.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article8.subtitle2"><P k="legal.terms.article8.p2" /></SubSection>
                        </Section>

                        {/* Article 9 */}
                        <Section number="9" titleKey="legal.terms.article9.title">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                                <p className="text-yellow-200 leading-relaxed"><strong>{t('legal.terms.article9.important')}</strong> {t('legal.terms.article9.p1')}</p>
                            </div>
                            <p className="text-gray-300 leading-relaxed mb-3"><strong className="text-white">{t('legal.terms.article9.p2')}</strong></p>
                            <List items={['legal.terms.article9.point1', 'legal.terms.article9.point2', 'legal.terms.article9.point3']} />
                        </Section>

                        {/* Article 10 */}
                        <Section number="10" titleKey="legal.terms.article10.title">
                            <SubSection titleKey="legal.terms.article10.subtitle1"><P k="legal.terms.article10.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article10.subtitle2">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article10.p2')}</p>
                                <List items={['legal.terms.article10.license1', 'legal.terms.article10.license2', 'legal.terms.article10.license3']} />
                            </SubSection>
                            <SubSection titleKey="legal.terms.article10.subtitle3"><P k="legal.terms.article10.p3" /></SubSection>
                        </Section>

                        {/* Article 11 */}
                        <Section number="11" titleKey="legal.terms.article11.title">
                            <SubSection titleKey="legal.terms.article11.subtitle1"><P k="legal.terms.article11.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article11.subtitle2"><P k="legal.terms.article11.p2" /></SubSection>
                            <SubSection titleKey="legal.terms.article11.subtitle3"><P k="legal.terms.article11.p3" /></SubSection>
                        </Section>

                        {/* Article 12 */}
                        <Section number="12" titleKey="legal.terms.article12.title">
                            <SubSection titleKey="legal.terms.article12.subtitle1"><P k="legal.terms.article12.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article12.subtitle2">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article12.p2')}</p>
                                <List items={['legal.terms.article12.data1', 'legal.terms.article12.data2', 'legal.terms.article12.data3', 'legal.terms.article12.data4']} />
                            </SubSection>
                            <SubSection titleKey="legal.terms.article12.subtitle3">
                                <p className="text-gray-300 leading-relaxed mb-3">{t('legal.terms.article12.p3')}</p>
                                <List items={['legal.terms.article12.right1', 'legal.terms.article12.right2', 'legal.terms.article12.right3', 'legal.terms.article12.right4', 'legal.terms.article12.right5', 'legal.terms.article12.right6']} />
                                <P k="legal.terms.article12.p4" />
                            </SubSection>
                        </Section>

                        {/* Article 13-18 */}
                        <Section number="13" titleKey="legal.terms.article13.title">
                            <P k="legal.terms.article13.p1" />
                            <p className="text-gray-300 leading-relaxed">{t('legal.terms.article13.p2')} <Link to="/cookies" className="text-hyt-accent hover:underline">{t('legal.cookies.title')}</Link>.</p>
                        </Section>

                        <Section number="14" titleKey="legal.terms.article14.title">
                            <SubSection titleKey="legal.terms.article14.subtitle1"><P k="legal.terms.article14.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article14.subtitle2"><P k="legal.terms.article14.p2" /></SubSection>
                            <SubSection titleKey="legal.terms.article14.subtitle3"><P k="legal.terms.article14.p3" /></SubSection>
                        </Section>

                        <Section number="15" titleKey="legal.terms.article15.title">
                            <SubSection titleKey="legal.terms.article15.subtitle1"><P k="legal.terms.article15.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article15.subtitle2"><P k="legal.terms.article15.p2" /></SubSection>
                            <SubSection titleKey="legal.terms.article15.subtitle3"><P k="legal.terms.article15.p3" /></SubSection>
                        </Section>

                        <Section number="16" titleKey="legal.terms.article16.title">
                            <P k="legal.terms.article16.p1" />
                            <P k="legal.terms.article16.p2" />
                        </Section>

                        <Section number="17" titleKey="legal.terms.article17.title">
                            <P k="legal.terms.article17.p1" />
                            <P k="legal.terms.article17.p2" />
                            <P k="legal.terms.article17.p3" />
                        </Section>

                        <Section number="18" titleKey="legal.terms.article18.title">
                            <SubSection titleKey="legal.terms.article18.subtitle1"><P k="legal.terms.article18.p1" /></SubSection>
                            <SubSection titleKey="legal.terms.article18.subtitle2"><P k="legal.terms.article18.p2" /></SubSection>
                            <SubSection titleKey="legal.terms.article18.subtitle3"><P k="legal.terms.article18.p3" /></SubSection>
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