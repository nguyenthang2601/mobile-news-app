import React, { useContext, useEffect, useState } from 'react';

import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import md5 from 'md5';

import moment from 'moment';

import { Bookmark, Bubble, ShareIcon } from '../../components/icons';

import { WebView } from 'react-native-webview';

import Loading from '../../components/Loading';
import {
  AuthContext,
  BookmarkContext,
  LanguageContext,
  SettingsContext,
  ThemeContext,
} from '../../context';
import { AddComment, BottomSheet, CommentList } from '../../components';
import { getUser } from '../../utils/fetch/user';
import { deleteDraft, saveDraft } from '../../utils/fetch/draft';
import { getComment, saveComment } from '../../utils/fetch/comment';

const DetailView = ({ route, navigation }) => {
  const data = route.params.data;

  //---Context--/
  const { isJSEnabled } = useContext(SettingsContext);
  const { mode } = useContext(ThemeContext);
  const { user, setIsAuth, setUser } = useContext(AuthContext);
  const {
    setUrl,
    isBookmarked,
    setIsBookmarked,
    setBookmarks,
    bookmarks,
  } = useContext(BookmarkContext);
  const { strings } = useContext(LanguageContext);

  //---Button,Modal---//
  const [addTodoVisible, setAddTodoVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  //----Comments----//
  const [comms, setComms] = useState([]);
  const [commentText, setCommentText] = useState('');

  const [dbUser, setDbUser] = useState(null);

  //----Bookmarks----//

  // useEffect(() => {
  //   const unsub = navigation.addListener('focus', async () => {
  //     try {
  //       if (!user) {
  //         const snap = await getUser('');
  //         if (snap) {
  //           setDbUser(snap);
  //           setUser(snap);
  //         }
  //       }
  //     } catch (error) {
  //       Alert.alert(
  //         'Error happened',
  //         'Please refresh the app some error occured in database',
  //       );
  //     }
  //   });
  //   return unsub;
  // }, [navigation, user]);

  useEffect(() => {
    setUrl(data.url);

    return () => {
      setUrl('');
    };
  }, []);

  const listComment = async (params) => {
    const comments = await getComment(params);
    return comments;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        console.log('go to useEffect list comment', user, data.url);
        if (data.url && user) {
          console.log('start get comment line 102');
          const comments = await listComment({ url: data.url });
          console.log(comments, 1111111111111111111111111);
          if (comments) {
            setComms(comments);
          }
        }
      } catch (err) {
        console.log('error while getting comments', err);
      }
    });

    return unsubscribe;
  }, [navigation, data.url]);

  const authButton = () =>
    Alert.alert(
      'No Authentication Detected',
      'You have to login to save the news',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Login', onPress: () => setIsAuth(true) },
      ],
      { cancelable: true },
    );

  const addComment = async (url) => {
    try {
      if (user) {
        const submitTime = moment(new Date()).format('YYYY-MM-DD HH:MM');

        const commentData = {
          id: user.uid,
          name: user?.username,
          commentText,
          submitTime,
        };

        if (url) {
          console.log('start save');
          const comment = await saveComment({ ...data, comment: commentText });

          if (comment) {
            const comments = await listComment({ url });
            console.log(comments, 'after add comment');
            if (comments) {
              setComms(comments);
            }
          }
        }
      } else {
        authButton();
      }
    } catch (err) {
      console.log('error while adding comment to article', err.message);
    }

    setCommentText('');
    Keyboard.dismiss();
  };

  const saveArt = async (url) => {
    try {
      if (user) {
        const newUrl = md5(url);
        console.log('newUrl', newUrl);
        if (newUrl) {
          const storeDraft = await saveDraft({
            ...data,
            publishedAt: moment(new Date(data.publishedAt)).format(
              'YYYY-MM-DD HH:MM',
            ),
          });
          if (storeDraft) {
            setBookmarks([data, ...bookmarks]);
            setIsBookmarked(true);
          }
        }
      } else {
        authButton();
      }
    } catch (err) {
      console.log('error when clicked bookmark button', err.message);
    }
  };

  const removeArt = async (url) => {
    try {
      const ind = bookmarks.findIndex((bookmark) => bookmark.url === url);
      if (ind > 0) {
        bookmarks.splice(ind, 1);
      } else {
        bookmarks.shift();
      }
      const newUrl = md5(url);
      if (newUrl) {
        const removeDraft = await deleteDraft({ url: data.url });
        if (removeDraft) {
          setIsBookmarked(false);
        }
      }
    } catch (err) {
      console.log('error when clicked UNbookmark button', err);
    }
  };

  const toggleAddToModal = () => {
    setAddTodoVisible(!addTodoVisible);
  };

  const toggleBottomSheet = () => {
    if (user) {
      setBottomSheetVisible(!bottomSheetVisible);
    } else {
      authButton();
    }
  };

  const onShare = async () => {
    try {
      let text = `${data.title} \n\nSee more about the news...\nDownload World News App\n`;
      if (Platform.OS === 'android') {
        text = text.concat(
          'https://play.google.com/store/apps/details?id=com.tdksozlukreactnative',
        );
      } else {
        text = text.concat('https://itunes.apple.com');
      }
      await Share.share({
        title: 'Cekmecem News',
        // message: data.title,
        message: text,
        url: 'app://cekmecemnews',
      });
    } catch (err) {
      console.log('error while trying to share a news', err.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        backgroundColor: mode.colors.background,
      }}
    >
      <Modal
        animationType="slide"
        visible={addTodoVisible}
        onRequestClose={toggleAddToModal}
        statusBarTranslucent={addTodoVisible && true}
      >
        <CommentList
          closeModal={toggleAddToModal}
          data={data}
          addComment={addComment}
          comms={comms}
          commentText={commentText}
          setCommentText={setCommentText}
          str={strings}
          authenticated={user ? true : false}
        />
      </Modal>
      <BottomSheet
        closeBottomSheet={toggleBottomSheet}
        visible={bottomSheetVisible}
      >
        <AddComment
          data={data}
          commentText={commentText}
          setCommentText={setCommentText}
          addComment={addComment}
          str={strings}
          closeModal={toggleBottomSheet}
          authenticatedUser={dbUser?.name}
        />
      </BottomSheet>

      <View
        style={[
          styles.buttonsContainer,
          { backgroundColor: mode.colors.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.allComments, { borderColor: mode.colors.icon }]}
          onPress={toggleAddToModal}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: 'normal',
              color: mode.colors.icon,
            }}
          >
            {strings.comments}
            {comms?.length > 0 ? ` (${comms?.length})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.otherButtons}
          onPress={toggleBottomSheet}
        >
          <Bubble width={24} color={mode.colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.otherButtons}
          onPress={
            isBookmarked ? () => removeArt(data.url) : () => saveArt(data?.url)
          }
        >
          <Bookmark
            size={24}
            fill={isBookmarked ? mode.colors.icon : 'transparent'}
            color={mode.colors.icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.otherButtons} onPress={onShare}>
          <ShareIcon size={24} color={mode.colors.icon} />
        </TouchableOpacity>
      </View>

      <WebView
        style={{ backgroundColor: mode.colors.background }}
        source={{ uri: data?.url }}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        mediaPlaybackRequiresUserAction={true}
        javaScriptEnabled={isJSEnabled}
        renderError={() =>
          Alert.alert(
            'Error occured',
            'Website is not reacheable now, maybe try to block ads and flashes on settings',
          )
        }
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        incognito={true}
        startInLoadingState={true}
        renderLoading={() => <Loading />}
        userAgent={
          'Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3714.0 Mobile Safari/537.36'
        }
      />
    </View>
  );
};

export default DetailView;

const styles = StyleSheet.create({
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingBottom: 12,
  },
  allComments: {
    height: 48,
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    borderWidth: 0.1,
    marginLeft: 6,
  },
  otherButtons: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
