import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';

const SellerItem = () => {
    const { userId } = useParams();
    const user = sellers.find(u => u.id === Number(userId));
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div style={styles.wrapper}>
        <div style={styles.container}>
            <div style={styles.header}>
            <div style={styles.backButton}><span onClick={goBack}>←</span></div>
            <div style={styles.headerTitle}>{user.name}</div>
            <div style={{ width: 18 }} />
            </div>
            <div style={styles.banner}>배너 이미지 영역</div>
            <div style={styles.sellerProfileBox}>
            <div style={styles.profileImage}>👩‍🍳</div>
            <div style={styles.profileInfo}>
                <div style={styles.profileName}>{user.name}</div>
                <div style={styles.profileDesc}>정성으로 요리합니다 :)</div>
            </div>
            </div>
            <div style={styles.sectionTitleBar}>즉시 판매</div>
            <div style={styles.productSection}>
                {user.sellingType === 'immediate' && user.menus.map(menu => (
                    <div style={styles.productCard} key={menu.id} onClick={() => navigate(`/menu/${menu.id}`)}>
                        <div style={styles.productInfo}>
                            <div style={styles.productTitle}>{menu.name}</div>
                            <div style={styles.productMeta}>{menu.desc}</div>
                        </div>
                        <div style={styles.editIcon}>🖋️</div>
                    </div>
                ))}
            </div>
            <div style={styles.sectionTitleBar}>예약 판매</div>
                <div style={styles.productSection}>
                    {user.sellingType === 'reservation' && user.menus.map(menu => (
                        <div style={styles.productCard} key={menu.id} onClick={() => navigate(`/menu/${menu.id}`)}>
                            <div style={styles.productInfo}>
                                <div style={styles.productTitle}>{menu.name}</div>
                                <div style={styles.productMeta}>{menu.desc}</div>
                            </div>
                            <div style={styles.editIcon}>🖋️</div>
                        </div>
                    ))}
                </div>
        </div>
        </div>
    );
};

const styles = {
    wrapper: {
        minHeight: '100vh',
        background: '#fff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        paddingBottom: 50,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: 16,
        borderBottom: '1px solid #ddd',
        position: 'relative',
    },
    backButton: {
        cursor: 'pointer',
        fontSize: 18,
        color: '#333',
    },
    headerTitle: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontWeight: 'bold',
    },
    banner: {
        width: '100%',
        height: 120,
        backgroundColor: '#ddd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        color: '#555',
    },
    sellerProfileBox: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
    },
    profileImage: {
        width: 60,
        height: 60,
        backgroundColor: '#fcd265',
        borderRadius: '50%',
        fontSize: 28,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    profileDesc: {
        fontSize: 13,
        color: '#666',
    },
    sectionTitleBar: {
        padding: '10px 20px 6px',
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: '#f7f7f7',
    },
    productSection: {
        maxHeight: 62 * 5,
        overflowY: 'auto',
        borderBottom: '8px solid #f7f7f7',
    },
    productCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #eee',
        fontSize: 14,
    },
    productInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    productTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productMeta: {
        fontSize: 12,
        color: '#999',
    },
    editIcon: {
        fontSize: 16,
        color: '#999',
        marginLeft: 10,
    },
};

export default SellerItem;